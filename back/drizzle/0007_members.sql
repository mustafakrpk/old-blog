-- Faz 5 — Takım üyeliği (members + invites)
CREATE TABLE IF NOT EXISTS "members" (
	"workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"role" text NOT NULL DEFAULT 'member',
	"created_at" timestamp DEFAULT now() NOT NULL,
	PRIMARY KEY ("workspace_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "invites" (
	"workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
	"email" text NOT NULL,
	"role" text NOT NULL DEFAULT 'member',
	"created_at" timestamp DEFAULT now() NOT NULL,
	PRIMARY KEY ("workspace_id", "email")
);

-- Backfill: her mevcut workspace'in sahibi owner üyesi olur.
INSERT INTO "members" ("workspace_id", "user_id", "role")
SELECT id, owner_id, 'owner' FROM "workspaces"
ON CONFLICT DO NOTHING;
