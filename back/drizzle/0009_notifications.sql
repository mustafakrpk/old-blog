-- Faz 5+ — Bildirimler
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"type" text NOT NULL,
	"actor_slug" text,
	"actor_name" text,
	"read" boolean NOT NULL DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "notifications_ws_idx" ON "notifications" ("workspace_id");
