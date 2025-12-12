// Atlas project configuration for Ent versioned migrations.
// Run all atlas commands from the `api/` directory.

env "dev" {
  // Safe sandbox database for local migration testing.
  // Atlas will spin up a temporary Postgres container.
  url = "docker://postgres/16/quicklinks?search_path=public"
  dev = "docker://postgres/16/quicklinks_dev?search_path=public"

  migration {
    dir = "file://ent/migrate/migrations"
    // Use `public` to avoid requiring CREATE SCHEMA privileges on managed DBs.
    revisions_schema = "public"
  }

  schema {
    // Ent schema directory (relative to `api/`).
    src = "ent://ent/schema"
  }
}

env "supabase" {
  // Target database (Supabase). Keep credentials out of the repo.
  url = getenv("DATABASE_URL")
  dev = "docker://postgres/16/quicklinks_dev?search_path=public"

  migration {
    dir = "file://ent/migrate/migrations"
    // Use `public` to avoid requiring CREATE SCHEMA privileges on managed DBs.
    revisions_schema = "public"
  }

  schema {
    src = "ent://ent/schema"
  }
}
