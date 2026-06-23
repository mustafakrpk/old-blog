-- Faz 1 Adım 2 — Multi-tenant izolasyon migration'ı
-- Mevcut tek graph'ı "founder" workspace'ine taşır, composite PK'lere geçer.
-- GÜVENLİ: transaction içinde, idempotent (IF EXISTS / ON CONFLICT).
-- Uygulamadan ÖNCE Neon'da branch yedeği almanız önerilir.

BEGIN;

-- 1) workspaces tablosu
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"custom_domain" text,
	"default_mode" "visibility" DEFAULT 'professional' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 2) Founder workspace'i: mevcut (en eski) kullanıcı sahibi.
--    default_mode = god_mode → mevcut public site davranışı korunur (her şey görünür).
INSERT INTO "workspaces" ("id","owner_id","slug","name","plan","default_mode")
SELECT 'ws_founder', u.id, 'mustafa',
       COALESCE(NULLIF(u.name, ''), 'Mustafa'), 'pro', 'god_mode'
FROM "user" u
ORDER BY u.created_at
LIMIT 1
ON CONFLICT ("id") DO NOTHING;

-- 3) workspace_id kolonları (önce nullable)
ALTER TABLE "nodes" ADD COLUMN IF NOT EXISTS "workspace_id" text;
ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "workspace_id" text;

-- 4) Backfill: tüm mevcut veri founder workspace'ine
UPDATE "nodes" SET "workspace_id" = 'ws_founder' WHERE "workspace_id" IS NULL;
UPDATE "links" SET "workspace_id" = 'ws_founder' WHERE "workspace_id" IS NULL;

-- 5) Artık NOT NULL
ALTER TABLE "nodes" ALTER COLUMN "workspace_id" SET NOT NULL;
ALTER TABLE "links" ALTER COLUMN "workspace_id" SET NOT NULL;

-- 6) Eski constraint'leri kaldır (isimler canlı DB'den doğrulandı)
ALTER TABLE "links" DROP CONSTRAINT IF EXISTS "links_source_nodes_id_fk";
ALTER TABLE "links" DROP CONSTRAINT IF EXISTS "links_target_nodes_id_fk";
ALTER TABLE "links" DROP CONSTRAINT IF EXISTS "links_source_target_pk";
ALTER TABLE "nodes" DROP CONSTRAINT IF EXISTS "nodes_pkey";

-- 7) Composite primary key'ler
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_pkey"
	PRIMARY KEY ("workspace_id","id");
ALTER TABLE "links" ADD CONSTRAINT "links_pkey"
	PRIMARY KEY ("workspace_id","source","target");

-- 8) Foreign key'ler (workspace içine kapalı)
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_workspace_id_fk"
	FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;
ALTER TABLE "links" ADD CONSTRAINT "links_source_fk"
	FOREIGN KEY ("workspace_id","source")
	REFERENCES "nodes"("workspace_id","id") ON DELETE CASCADE;
ALTER TABLE "links" ADD CONSTRAINT "links_target_fk"
	FOREIGN KEY ("workspace_id","target")
	REFERENCES "nodes"("workspace_id","id") ON DELETE CASCADE;

COMMIT;
