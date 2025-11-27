CREATE TABLE IF NOT EXISTS links (
  id uuid primary key default gen_random_uuid(),
  user_identifier text,
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
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_links_user_saved_at
  on links (user_identifier, saved_at desc);

CREATE INDEX IF NOT EXISTS idx_links_domain
  on links (domain);

CREATE TABLE IF NOT EXISTS digests (
  id uuid primary key default gen_random_uuid(),
  user_identifier text,
  period_start timestamptz not null,
  period_end timestamptz not null,
  content text,
  public_slug text unique,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_digests_user_period
  on digests (user_identifier, period_start desc);

CREATE INDEX IF NOT EXISTS idx_digests_public_slug
  on digests (public_slug) where public_slug is not null;
