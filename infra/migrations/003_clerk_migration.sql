ALTER TABLE links RENAME COLUMN user_identifier TO user_id;

ALTER TABLE digests RENAME COLUMN user_identifier TO user_id;

DROP INDEX IF EXISTS idx_links_user_saved_at;
CREATE INDEX idx_links_user_saved_at ON links (user_id, saved_at DESC);

DROP INDEX IF EXISTS idx_digests_user_period;
CREATE INDEX idx_digests_user_period ON digests (user_id, period_start DESC);
