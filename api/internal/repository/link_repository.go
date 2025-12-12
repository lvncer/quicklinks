package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"entgo.io/ent/dialect/sql"
	appent "github.com/lvncer/quicklinks/api/ent"
	"github.com/lvncer/quicklinks/api/ent/link"
	"github.com/lvncer/quicklinks/api/internal/model"
)

// LinkRepository defines persistence operations for links.
type LinkRepository interface {
	CreateLink(ctx context.Context, input CreateLinkInput) (string, error)
	ListLinks(ctx context.Context, userID string, filter ListLinksFilter) ([]model.Link, error)
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

type ListLinksFilter struct {
	Limit  int
	From   *time.Time // inclusive
	To     *time.Time // exclusive
	Domain string
	Tags   []string // OR semantics (any-match)
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
		SetTags(input.Tags).
		SetNillablePublishedAt(input.PublishedAt).
		Save(ctx)
	if err != nil {
		return "", err
	}

	return linkEntity.ID.String(), nil
}

func (r *entLinkRepository) ListLinks(ctx context.Context, userID string, filter ListLinksFilter) ([]model.Link, error) {
	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
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
			link.FieldTags,
			link.FieldSavedAt,
			link.FieldCreatedAt,
			link.FieldPublishedAt,
		).
		Where(link.UserIDEQ(userID)).
		Where(func(s *sql.Selector) {
			// Domain filter.
			if filter.Domain != "" {
				s.Where(sql.EQ(s.C(link.FieldDomain), filter.Domain))
			}

			// Time-range filter (COALESCE(published_at, saved_at)).
			if filter.From != nil || filter.To != nil {
				if filter.From != nil {
					from := *filter.From
					s.Where(sql.P(func(b *sql.Builder) {
						b.WriteString("COALESCE(")
						b.WriteString(s.C(link.FieldPublishedAt))
						b.WriteString(", ")
						b.WriteString(s.C(link.FieldSavedAt))
						b.WriteString(") >= ")
						b.Arg(from)
					}))
				}
				if filter.To != nil {
					to := *filter.To
					s.Where(sql.P(func(b *sql.Builder) {
						b.WriteString("COALESCE(")
						b.WriteString(s.C(link.FieldPublishedAt))
						b.WriteString(", ")
						b.WriteString(s.C(link.FieldSavedAt))
						b.WriteString(") < ")
						b.Arg(to)
					}))
				}
			}

			// Tag filter (jsonb array contains). OR semantics.
			if len(filter.Tags) > 0 {
				col := s.C(link.FieldTags)
				preds := make([]*sql.Predicate, 0, len(filter.Tags))
				for _, t := range filter.Tags {
					// Build a one-element JSON array: ["tag"].
					b, err := json.Marshal([]string{t})
					if err != nil {
						// Should never happen for string inputs; ignore this tag.
						continue
					}
					jsonArr := string(b)
					preds = append(preds, sql.P(func(b *sql.Builder) {
						b.WriteString(col)
						b.WriteString(" @> ")
						b.Arg(jsonArr)
						b.WriteString("::jsonb")
					}))
				}
				if len(preds) > 0 {
					s.Where(sql.Or(preds...))
				}
			}
		}).
		Order(func(s *sql.Selector) {
			effective := fmt.Sprintf(
				"COALESCE(%s, %s)",
				s.C(link.FieldPublishedAt),
				s.C(link.FieldSavedAt),
			)
			s.OrderBy(
				sql.Desc(effective),
				sql.Desc(s.C(link.FieldSavedAt)),
				sql.Desc(s.C(link.FieldID)),
			)
		}).
		Limit(limit).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return entLinksToModels(entities), nil
}
