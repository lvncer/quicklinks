package model

import "time"

type LinkCreateRequest struct {
	URL            string   `json:"url" binding:"required"`
	Title          string   `json:"title" binding:"required"`
	PageURL        string   `json:"page" binding:"required"`
	Note           string   `json:"note"`
	UserIdentifier string   `json:"user_identifier"`
	Tags           []string `json:"tags"`
}

type Link struct {
	ID             string    `json:"id"`
	URL            string    `json:"url"`
	Title          string    `json:"title"`
	Domain         string    `json:"domain"`
	PageURL        string    `json:"page_url"`
	Note           string    `json:"note"`
	UserIdentifier string    `json:"user_identifier"`
	SavedAt        time.Time `json:"saved_at"`
}
