ALTER TABLE links ADD COLUMN published_at TIMESTAMPTZ;

CREATE INDEX idx_links_published_at ON links (published_at);
