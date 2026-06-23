-- Faz 4 — Stripe billing alanları (additive, güvenli)
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
