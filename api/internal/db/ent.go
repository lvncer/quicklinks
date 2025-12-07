package db

import (
	"database/sql"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/lvncer/quicklinks/api/ent"
)

// NewEntClient creates a new Ent client using the pgx database/sql driver.
//
// Note: Migrations are not executed automatically. Schema changes should be
// applied explicitly using dedicated commands, not at application startup.
func NewEntClient(dsn string) (*ent.Client, error) {
	// Use pgx's database/sql compatibility layer.
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	// Wrap the *sql.DB with Ent's SQL driver for PostgreSQL.
	drv := entsql.OpenDB(dialect.Postgres, db)

	client := ent.NewClient(ent.Driver(drv))
	return client, nil
}
