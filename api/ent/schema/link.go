package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/entsql"
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
			Default(uuid.New).
			Annotations(entsql.DefaultExpr("gen_random_uuid()")),
		field.String("user_id").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("url").
			NotEmpty().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("title").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("description").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("domain").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("og_image").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("page_url").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		field.String("note").
			Optional().
			Nillable().
			SchemaType(map[string]string{dialect.Postgres: "text"}),
		// NOTE:
		// - Old DB schema used `text[]` for tags.
		// - M4 migrates it to `jsonb` and manages it as []string via Ent.
		field.JSON("tags", []string{}).
			Optional(),
		field.JSON("metadata", map[string]any{}).
			Default(map[string]any{}).
			Annotations(entsql.DefaultExpr("'{}'::jsonb")),
		field.Time("saved_at").
			Default(time.Now).
			Annotations(entsql.DefaultExpr("now()")),
		field.Time("created_at").
			Default(time.Now).
			Annotations(entsql.DefaultExpr("now()")),
		field.Time("published_at").
			Optional().
			Nillable(),
	}
}

// Indexes of the Link.
func (Link) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id", "saved_at").
			StorageKey("idx_links_user_saved_at").
			Annotations(entsql.DescColumns("saved_at")),
		index.Fields("domain").
			StorageKey("idx_links_domain"),
		index.Fields("published_at").
			StorageKey("idx_links_published_at"),
		index.Fields("tags").
			StorageKey("idx_links_tags_gin").
			Annotations(entsql.IndexType("GIN")),
	}
}
