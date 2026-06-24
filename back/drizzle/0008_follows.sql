-- Faz 5+ — Takip sistemi (galaksi -> galaksi)
CREATE TABLE IF NOT EXISTS "follows" (
	"follower_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"following_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	PRIMARY KEY ("follower_id", "following_id")
);
