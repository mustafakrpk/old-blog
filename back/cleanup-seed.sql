-- ════════════════════════════════════════════════════════════════
-- Seed Temizliği — back/scripts/seed.ts kaynaklı 252 node'u sil
-- ════════════════════════════════════════════════════════════════
-- back/scripts/seed.ts'in eklediği örnek/portfolyo data'sını kaldırır.
-- Kullanıcının manuel eklediği farklı ID'li node'lar etkilenmez.
--
-- Silinecek pattern'ler:
--   - 'me', 'about', 'uses' (3 sabit ID)
--   - 'skill-*'  (örn skill-react, skill-react--hooks)
--   - 'proj-*'   (örn proj-knowledge-graph, proj-knowledge-graph--force-layout)
--   - 'blog-*'   (örn blog-why-3d, blog-why-3d--creativity)
--
-- KULLANIM:
-- 1. Neon Console → SQL Editor (https://console.neon.tech)
-- 2. Bu dosyayı yapıştır → RUN
-- 3. Sonra seed-personal.sql'i çalıştır (kişisel içerik için)
--
-- ⚠️ DİKKAT: 'about' node'unun düzenlenmiş içeriği varsa kaybolur!
-- ════════════════════════════════════════════════════════════════

-- (Opsiyonel) Önce yedek al — kopyala bir yere
-- SELECT id, title, content, meta FROM nodes WHERE id = 'about';

BEGIN;

-- Önce mevcut sayıları gör
SELECT
  (SELECT COUNT(*) FROM nodes) AS once_node,
  (SELECT COUNT(*) FROM links) AS once_link;

-- Seed node'larını sil (link'ler CASCADE ile otomatik gider)
DELETE FROM nodes
WHERE id IN ('me', 'about', 'uses')
   OR id LIKE 'skill-%'
   OR id LIKE 'proj-%'
   OR id LIKE 'blog-%'
   OR id LIKE 'about--%'   -- about'un keyword child'ları (about--building, about--writing, vs.)
   OR id LIKE 'uses--%';   -- uses'un keyword child'ları (uses--vs-code, vs.)

-- Sonra mevcut sayıları gör
SELECT
  (SELECT COUNT(*) FROM nodes) AS sonra_node,
  (SELECT COUNT(*) FROM links) AS sonra_link;

-- Kalan node'lar (kullanıcı eklediyse görünür)
SELECT id, title, type FROM nodes ORDER BY id;

COMMIT;

-- ════════════════════════════════════════════════════════════════
-- Beklenen: sonra_node = 0, sonra_link = 0
-- (Kullanıcı admin panelden farklı ID'li node ekledyse onlar kalır)
-- ════════════════════════════════════════════════════════════════
