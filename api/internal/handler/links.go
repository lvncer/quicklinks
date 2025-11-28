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

	"github.com/lvncer/quicklinks/api/internal/model"
)

type LinksHandler struct {
	DB           *pgxpool.Pool
	SharedSecret string
}

func NewLinksHandler(db *pgxpool.Pool, secret string) *LinksHandler {
	return &LinksHandler{DB: db, SharedSecret: secret}
}

func (h *LinksHandler) Register(r *gin.Engine) {
	r.POST("/api/links", h.CreateLink)
	r.GET("/api/links", h.GetLinks)
}

func (h *LinksHandler) CreateLink(c *gin.Context) {
	secret := c.GetHeader("X-QuickLink-Secret")
	if secret == "" || secret != h.SharedSecret {
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	var id string
	query := `
		insert into links (
			user_identifier,
			url,
			title,
			description,
			domain,
			og_image,
			page_url,
			note,
			tags,
			metadata,
			saved_at,
			created_at
		)
		values ($1, $2, $3, '', $4, '', $5, $6, $7, '{}'::jsonb, now(), now())
		returning id
	`

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	err = h.DB.QueryRow(ctx, query,
		req.UserIdentifier,
		req.URL,
		req.Title,
		domain,
		req.PageURL,
		req.Note,
		tags,
	).Scan(&id)
	if err != nil {
		log.Printf("database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to insert link", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id})
}

func (h *LinksHandler) GetLinks(c *gin.Context) {
	secret := c.GetHeader("X-QuickLink-Secret")
	if secret == "" || secret != h.SharedSecret {
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
		SELECT id, user_identifier, url, title, domain, page_url, note, saved_at
		FROM links
		ORDER BY saved_at DESC
		LIMIT $1
	`

	rows, err := h.DB.Query(ctx, query, limit)
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
			&link.UserIdentifier,
			&link.URL,
			&link.Title,
			&link.Domain,
			&link.PageURL,
			&link.Note,
			&link.SavedAt,
		)
		if err != nil {
			log.Printf("scan error: %v", err)
			continue
		}
		links = append(links, link)
	}

	c.JSON(http.StatusOK, gin.H{"links": links})
}
