package handler

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/lvncer/quicklinks/api/internal/middleware"
	"github.com/lvncer/quicklinks/api/internal/model"
	"github.com/lvncer/quicklinks/api/internal/repository"
	"github.com/lvncer/quicklinks/api/internal/service"
)

type LinksHandler struct {
	repo repository.LinkRepository
}

func NewLinksHandler(repo repository.LinkRepository) *LinksHandler {
	return &LinksHandler{repo: repo}
}

func (h *LinksHandler) Register(r *gin.Engine, authMiddleware gin.HandlerFunc) {
	api := r.Group("/api")
	api.Use(authMiddleware)
	{
		api.POST("/links", h.CreateLink)
		api.GET("/links", h.GetLinks)
		api.GET("/og", h.GetOGP)
	}
}

func (h *LinksHandler) CreateLink(c *gin.Context) {
	// Get user_id from middleware (already authenticated)
	userID := middleware.GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req model.LinkCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request", "detail": err.Error()})
		return
	}

	parsed, err := url.Parse(req.URL)
	if err != nil || parsed.Host == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url"})
		return
	}
	domain := parsed.Host
	domain = strings.TrimPrefix(domain, "www.")

	// Fetch OGP metadata
	// Note: In production, this should probably be done asynchronously
	// or in a background job to avoid slowing down the save request.
	// For MVP, we do it synchronously but with a short timeout inside the service.
	var description, ogImage string
	var publishedAt *time.Time
	meta, err := service.FetchMetadata(req.URL)
	if err == nil {
		description = meta.Description
		ogImage = meta.Image
		publishedAt = meta.PublishedAt
		// If title was not provided or is just the URL, use OGP title
		if req.Title == "" || req.Title == req.URL {
			if meta.Title != "" {
				req.Title = meta.Title
			}
		}
	} else {
		log.Printf("failed to fetch metadata for %s: %v", req.URL, err)
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	id, err := h.repo.CreateLink(ctx, repository.CreateLinkInput{
		UserID:      userID,
		URL:         req.URL,
		Title:       req.Title,
		Description: description,
		Domain:      domain,
		OGImage:     ogImage,
		PageURL:     req.PageURL,
		Note:        req.Note,
		Tags:        tags,
		PublishedAt: publishedAt,
	})
	if err != nil {
		log.Printf("repository error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert link", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id})
}

func (h *LinksHandler) GetLinks(c *gin.Context) {
	// Get user_id from middleware (already authenticated)
	userID := middleware.GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Parse limit query parameter (default: 50)
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 50
	}

	// Parse filter query parameters.
	var (
		from *time.Time
		to   *time.Time // exclusive
	)

	// Timezone for interpreting YYYY-MM-DD boundaries.
	// If omitted, defaults to UTC (backward-compatible).
	loc := time.UTC
	if tz := strings.TrimSpace(c.Query("tz")); tz != "" {
		l, err := time.LoadLocation(tz)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "invalid tz",
				"detail": "tz must be an IANA time zone (e.g. Asia/Tokyo)",
			})
			return
		}
		loc = l
	}

	if fromStr := c.Query("from"); fromStr != "" {
		t, err := time.ParseInLocation("2006-01-02", fromStr, loc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "invalid from",
				"detail": "from must be YYYY-MM-DD",
			})
			return
		}
		from = &t
	}

	if toStr := c.Query("to"); toStr != "" {
		t, err := time.ParseInLocation("2006-01-02", toStr, loc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "invalid to",
				"detail": "to must be YYYY-MM-DD",
			})
			return
		}
		t = t.AddDate(0, 0, 1) // make it exclusive (end-of-day inclusive behavior)
		to = &t
	}

	if from != nil && to != nil && !from.Before(*to) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "invalid range",
			"detail": "from must be before or equal to to",
		})
		return
	}

	domain := strings.TrimSpace(c.Query("domain"))
	domain = strings.TrimPrefix(domain, "www.")

	tags := c.QueryArray("tag")
	if len(tags) > 0 {
		uniq := make(map[string]struct{}, len(tags))
		normalized := make([]string, 0, len(tags))
		for _, t := range tags {
			t = strings.TrimSpace(t)
			if t == "" {
				continue
			}
			if _, ok := uniq[t]; ok {
				continue
			}
			uniq[t] = struct{}{}
			normalized = append(normalized, t)
		}
		tags = normalized
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	links, err := h.repo.ListLinks(ctx, userID, repository.ListLinksFilter{
		Limit:  limit,
		From:   from,
		To:     to,
		Domain: domain,
		Tags:   tags,
	})
	if err != nil {
		log.Printf("repository error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch links"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"links": links})
}

func (h *LinksHandler) GetOGP(c *gin.Context) {
	// Authentication is already handled by middleware
	// No need to check user_id for OGP fetching

	targetURL := c.Query("url")
	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}

	// Validate URL
	parsed, err := url.Parse(targetURL)
	if err != nil || parsed.Host == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url"})
		return
	}

	// Fetch OGP
	meta, err := service.FetchMetadata(targetURL)
	if err != nil {
		log.Printf("failed to fetch metadata: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"title":       meta.Title,
		"description": meta.Description,
		"image":       meta.Image,
		"date":        meta.PublishedAt,
	})
}
