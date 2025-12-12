-- Modify "links" table
ALTER TABLE "links"
  ALTER COLUMN "tags" TYPE jsonb
  USING to_jsonb("tags");
-- Create index "idx_links_tags_gin" to table: "links"
CREATE INDEX "idx_links_tags_gin" ON "links" USING gin ("tags");
