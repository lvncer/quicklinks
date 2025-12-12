-- Atlas baseline migration for `links`.
--
-- This file represents the schema state that existed before we started managing
-- migrations via Ent/Atlas versioned migrations.
--
-- Existing databases (e.g. Supabase production) should NOT execute this SQL.
-- Instead, mark this version as already applied:
--   atlas migrate apply --env supabase --baseline 20251212121929
--
-- New/empty databases may apply it normally:
--   atlas migrate apply --env dev

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS links (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  url text not null,
  title text,
  description text,
  domain text,
  og_image text,
  page_url text,
  note text,
  tags text[],
  metadata jsonb not null default '{}'::jsonb,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_links_user_saved_at
  on links (user_id, saved_at desc);

CREATE INDEX IF NOT EXISTS idx_links_domain
  on links (domain);

CREATE INDEX IF NOT EXISTS idx_links_published_at
  on links (published_at);
