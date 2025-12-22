package model

import "time"

type LinkCreateRequest struct {
	URL     string   `json:"url" binding:"required"`
	Title   string   `json:"title" binding:"required"`
	PageURL string   `json:"page" binding:"required"`
	Note    string   `json:"note"`
	Tags    []string `json:"tags"`
	// Optional client-provided metadata (best-effort).
	Description string `json:"description"`
	OGImage     string `json:"og_image"`
	// Note: user_id is now determined by the authenticated user, not from request body
}

type Link struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Domain      string    `json:"domain"`
	OGImage     string    `json:"og_image"`
	PageURL     string    `json:"page_url"`
	Note        string    `json:"note"`
	Tags        []string  `json:"tags"`
	UserID      string    `json:"user_id"`
	SavedAt     time.Time `json:"saved_at"`
}
