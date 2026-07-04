-- Worldbuilding node tipleri (additive, güvenli)
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'character';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'location';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'faction';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'event';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'lore';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'item';
ALTER TYPE "node_type" ADD VALUE IF NOT EXISTS 'creature';
