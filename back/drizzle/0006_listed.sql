-- Faz 3 — Keşfet (Explore) için listeleme bayrağı (opt-out)
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "listed" boolean NOT NULL DEFAULT true;
