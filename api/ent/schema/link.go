package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// Link holds the schema definition for the links table.
type Link struct {
	ent.Schema
}

// Fields of the Link.
func (Link) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(uuid.New),
		field.String("user_id").
			Optional().
			Nillable(),
		field.String("url").
			NotEmpty(),
		field.String("title").
			Optional().
			Nillable(),
		field.String("description").
			Optional().
			Nillable(),
		field.String("domain").
			Optional().
			Nillable(),
		field.String("og_image").
			Optional().
			Nillable(),
		field.String("page_url").
			Optional().
			Nillable(),
		field.String("note").
			Optional().
			Nillable(),
		field.Strings("tags").
			Optional(),
		field.JSON("metadata", map[string]any{}).
			Default(map[string]any{}),
		field.Time("saved_at").
			Default(time.Now),
		field.Time("created_at").
			Default(time.Now),
		field.Time("published_at").
			Optional().
			Nillable(),
	}
}

// Indexes of the Link.
func (Link) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id", "saved_at"),
		index.Fields("domain"),
		index.Fields("published_at"),
	}
}
