package repository

import (
	"context"
	"time"

	"entgo.io/ent/dialect/sql"
	appent "github.com/lvncer/quicklinks/api/ent"
	"github.com/lvncer/quicklinks/api/ent/link"
	"github.com/lvncer/quicklinks/api/internal/model"
)

// LinkRepository defines persistence operations for links.
type LinkRepository interface {
	CreateLink(ctx context.Context, input CreateLinkInput) (string, error)
	ListLinks(ctx context.Context, userID string, limit int) ([]model.Link, error)
}

// CreateLinkInput represents the data required to create a new link.
type CreateLinkInput struct {
	UserID      string
	URL         string
	Title       string
	Description string
	Domain      string
	OGImage     string
	PageURL     string
	Note        string
	Tags        []string
	PublishedAt *time.Time
}

type entLinkRepository struct {
	client *appent.Client
}

// NewLinkRepository creates a new Ent-backed implementation of LinkRepository.
func NewLinkRepository(client *appent.Client) LinkRepository {
	return &entLinkRepository{client: client}
}

func (r *entLinkRepository) CreateLink(ctx context.Context, input CreateLinkInput) (string, error) {
	linkEntity, err := r.client.Link.
		Create().
		SetUserID(input.UserID).
		SetURL(input.URL).
		SetTitle(input.Title).
		SetDescription(input.Description).
		SetDomain(input.Domain).
		SetOgImage(input.OGImage).
		SetPageURL(input.PageURL).
		SetNote(input.Note).
		SetNillablePublishedAt(input.PublishedAt).
		Save(ctx)
	if err != nil {
		return "", err
	}

	return linkEntity.ID.String(), nil
}

func (r *entLinkRepository) ListLinks(ctx context.Context, userID string, limit int) ([]model.Link, error) {
	entities, err := r.client.Link.
		Query().
		Select(
			link.FieldID,
			link.FieldUserID,
			link.FieldURL,
			link.FieldTitle,
			link.FieldDescription,
			link.FieldDomain,
			link.FieldOgImage,
			link.FieldPageURL,
			link.FieldNote,
			link.FieldSavedAt,
			link.FieldCreatedAt,
			link.FieldPublishedAt,
		).
		Where(link.UserIDEQ(userID)).
		Order(
			link.ByPublishedAt(sql.OrderDesc()),
			link.BySavedAt(sql.OrderDesc()),
		).
		Limit(limit).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return entLinksToModels(entities), nil
}
