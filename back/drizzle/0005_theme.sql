-- Faz 4+ — Premium temalar (Pro avantajı)
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "theme" text NOT NULL DEFAULT 'galaxy';
