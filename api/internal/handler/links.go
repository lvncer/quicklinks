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
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lvncer/quicklinks/api/internal/middleware"
	"github.com/lvncer/quicklinks/api/internal/model"
	"github.com/lvncer/quicklinks/api/internal/service"
)

type LinksHandler struct {
	DB *pgxpool.Pool
}

func NewLinksHandler(db *pgxpool.Pool) *LinksHandler {
	return &LinksHandler{DB: db}
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

	var id string
	query := `
		insert into links (
			user_id,
			url,
			title,
			description,
			domain,
			og_image,
			page_url,
			note,
			tags,
			metadata,
			published_at,
			saved_at,
			created_at
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, '{}'::jsonb, $10, now(), now())
		returning id
	`

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	err = h.DB.QueryRow(ctx, query,
		userID, // Use authenticated user_id instead of request's user_identifier
		req.URL,
		req.Title,
		description,
		domain,
		ogImage,
		req.PageURL,
		req.Note,
		tags,
		publishedAt,
	).Scan(&id)
	if err != nil {
		log.Printf("database error: %v", err)
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, url, title, description, domain, og_image, page_url, note, saved_at, published_at
		FROM links
		WHERE user_id = $1
		ORDER BY COALESCE(published_at, saved_at) DESC
		LIMIT $2
	`

	rows, err := h.DB.Query(ctx, query, userID, limit)
	if err != nil {
		log.Printf("database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch links"})
		return
	}
	defer rows.Close()

	links := []model.Link{}
	for rows.Next() {
		var link model.Link
		err := rows.Scan(
			&link.ID,
			&link.UserID,
			&link.URL,
			&link.Title,
			&link.Description,
			&link.Domain,
			&link.OGImage,
			&link.PageURL,
			&link.Note,
			&link.SavedAt,
			&link.PublishedAt,
		)
		if err != nil {
			log.Printf("scan error: %v", err)
			continue
		}
		links = append(links, link)
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
