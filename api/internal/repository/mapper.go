package repository

import (
	appent "github.com/lvncer/quicklinks/api/ent"
	"github.com/lvncer/quicklinks/api/internal/model"
)

// entLinkToModel converts an Ent Link entity to the public DTO model.Link.
func entLinkToModel(l *appent.Link) model.Link {
	var (
		title       string
		description string
		domain      string
		ogImage     string
		pageURL     string
		note        string
		userID      string
	)

	if l.Title != nil {
		title = *l.Title
	}
	if l.Description != nil {
		description = *l.Description
	}
	if l.Domain != nil {
		domain = *l.Domain
	}
	if l.OgImage != nil {
		ogImage = *l.OgImage
	}
	if l.PageURL != nil {
		pageURL = *l.PageURL
	}
	if l.Note != nil {
		note = *l.Note
	}
	if l.UserID != nil {
		userID = *l.UserID
	}

	return model.Link{
		ID:          l.ID.String(),
		URL:         l.URL,
		Title:       title,
		Description: description,
		Domain:      domain,
		OGImage:     ogImage,
		PageURL:     pageURL,
		Note:        note,
		UserID:      userID,
		PublishedAt: l.PublishedAt,
		SavedAt:     l.SavedAt,
	}
}

// entLinksToModels converts a slice of Ent Link entities to a slice of DTOs.
func entLinksToModels(links []*appent.Link) []model.Link {
	result := make([]model.Link, 0, len(links))
	for _, l := range links {
		result = append(result, entLinkToModel(l))
	}
	return result
}
