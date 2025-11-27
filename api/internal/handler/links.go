package handler

import (
	"context"
	"log"
	"net/http"
	"net/url"
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
