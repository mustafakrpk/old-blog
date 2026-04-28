-- ════════════════════════════════════════════════════════════════
-- Mustafa Kırpık — Kişisel Node Seed
-- ════════════════════════════════════════════════════════════════
-- Bu script ~21 node + ~30 link ekler. ON CONFLICT DO NOTHING ile
-- mevcut kayıtlara dokunmaz, sadece yeni olanları ekler.
--
-- KULLANIM:
-- 1. ÖNCE mevcut seed'i temizle (cleanup-seed.sql veya manuel DELETE)
-- 2. Neon Console → SQL Editor (https://console.neon.tech)
-- 3. Tüm bu dosyayı yapıştır → RUN
-- 4. Site'inde refresh → yeni node'ları göreceksin
--
-- DÜZENLEME: "[DÜZENLE]" yazan yerleri kişiselleştir (admin panelden)
-- ════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- ABOUT ME (merkez node)
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('about-me', 'About Me', 'hub', 'core', 'professional', 8,
 E'# Mustafa Kırpık\n\nMerhaba! Ben yazılım geliştirici. Bu site benim digital garden''ım — projelerim, yetenekler ve düşüncelerim arasındaki bağlantıları interaktif bir grafik olarak görebilirsin.\n\n## Şu an ne yapıyorum?\n- [DÜZENLE] Şu an hangi projedesin\n- Bu portfolyoyu geliştiriyorum\n\n## Beni nasıl kullanırsın?\n- Bir node''a tıkla → detay açılır\n- Search bar (`/`) ile ara\n- Mode switcher ile farklı görünümler\n\n## İletişim\n- E-posta: [DÜZENLE]\n- GitHub: [github.com/mustafakrpk](https://github.com/mustafakrpk)',
 '{"description": "Bu graph''ın merkezi", "category": "Personal", "date": "2026-04-28"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- HUB'lar (yapı taşları)
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('hub-work', 'Çalıştığım İşler', 'hub', 'career', 'professional', 5,
 'Profesyonel projelerim ve iş deneyimim.',
 '{"description": "Tüm iş deneyimim ve projelerim", "category": "Career"}'::jsonb),

('hub-skills', 'Yeteneklerim', 'hub', 'career', 'professional', 5,
 'Bildiğim ve aktif kullandığım teknolojiler.',
 '{"description": "Teknik yetenek seti", "category": "Career"}'::jsonb),

('hub-writing', 'Yazılarım', 'hub', 'library', 'explorer', 5,
 'Blog yazıları, notlar, deneyimler.',
 '{"description": "Yazdığım her şey", "category": "Library"}'::jsonb),

('hub-contact', 'İletişim', 'hub', 'core', 'professional', 4,
 'Bana ulaşmak için: e-posta, GitHub, LinkedIn',
 '{"description": "İletişim bilgileri", "link": "mailto:e.turgut@erkpa.com.tr"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SKILL'ler (yetenekler)
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('skill-typescript', 'TypeScript', 'skill', 'career', 'professional', 4,
 'Frontend ve backend tarafında günlük kullanım. Strict mode tercih ederim.',
 '{"description": "Type-safe JavaScript", "tags": ["frontend", "backend", "language"], "category": "Programming"}'::jsonb),

('skill-react', 'React', 'skill', 'career', 'professional', 4,
 'React 18/19 ile component-based UI geliştirme. Hooks, Server Components.',
 '{"description": "UI library", "tags": ["frontend", "ui"], "category": "Frontend"}'::jsonb),

('skill-nextjs', 'Next.js', 'skill', 'career', 'professional', 4,
 'App Router, Server Actions, ISR — full-stack React framework.',
 '{"description": "Full-stack React framework", "tags": ["frontend", "backend", "ssr"], "category": "Frontend", "link": "https://nextjs.org"}'::jsonb),

('skill-vite', 'Vite', 'skill', 'career', 'professional', 3,
 'Hızlı dev server + production build. SPA ve library projelerinde tercih.',
 '{"description": "Build tool", "tags": ["build", "frontend"], "category": "Tooling"}'::jsonb),

('skill-postgresql', 'PostgreSQL', 'skill', 'career', 'professional', 4,
 'İlişkisel DB. JSONB, full-text search, window functions.',
 '{"description": "Relational database", "tags": ["database", "sql"], "category": "Backend"}'::jsonb),

('skill-drizzle', 'Drizzle ORM', 'skill', 'career', 'professional', 3,
 'Type-safe ORM. Schema-first yaklaşım, migration sistemi temiz.',
 '{"description": "TypeScript ORM", "tags": ["database", "orm"], "category": "Backend", "link": "https://orm.drizzle.team"}'::jsonb),

('skill-tailwind', 'Tailwind CSS', 'skill', 'career', 'professional', 3,
 'Utility-first CSS. Tailwind v4 ile birlikte design system kuruyorum.',
 '{"description": "Utility-first CSS framework", "tags": ["css", "frontend"], "category": "Frontend"}'::jsonb),

('skill-bun', 'Bun', 'skill', 'career', 'professional', 3,
 'Hızlı JS runtime + package manager. npm/yarn yerine bun tercih ediyorum.',
 '{"description": "JavaScript runtime", "tags": ["runtime", "tooling"], "category": "Tooling", "link": "https://bun.sh"}'::jsonb),

('skill-linux', 'Linux & Server Admin', 'skill', 'career', 'professional', 3,
 'Ubuntu sunucu yönetimi, Plesk, nginx, PM2, systemd.',
 '{"description": "Server operations", "tags": ["devops", "linux"], "category": "DevOps"}'::jsonb),

('skill-git', 'Git', 'skill', 'career', 'professional', 3,
 'Branch stratejileri, rebase workflow, GitHub CLI.',
 '{"description": "Version control", "tags": ["devops", "git"], "category": "Tooling"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- PROJECT'ler
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('project-digital-brain', 'Digital Garden — bu site', 'project', 'career', 'professional', 5,
 E'Görüyorsun ya, içindesin :)\n\nKişisel bilgi grafiği projesi. Ziyaretçi liste yerine **interaktif bir grafik** üzerinde geziniyor.\n\n## Stack\n- **Frontend:** Vite + React + react-force-graph\n- **Admin:** Next.js 16 (App Router, Server Actions)\n- **DB:** Neon PostgreSQL + Drizzle ORM\n- **Server:** Plesk + PM2 + nginx\n\n## Özellikler\n- 8 farklı node tipi (hub, project, skill, blog, ...)\n- 5 cluster (career, library, playground, ...)\n- 3 visibility seviyesi (public/explorer/private)\n- Admin panel ile içerik yönetimi',
 '{"description": "Kişisel knowledge graph + portfolyo", "tags": ["nextjs", "react", "vite", "postgresql"], "link": "https://github.com/mustafakrpk/old-blog", "category": "Personal Project", "date": "2026-04-21"}'::jsonb),

('project-erkpa', '[DÜZENLE] Erkpa İş Projesi', 'project', 'career', 'professional', 4,
 'Erkpa''da çalıştığım proje hakkında bilgi. Sorumluluklar, kullanılan teknolojiler, başardıkların.',
 '{"description": "Şirket projesi", "tags": ["typescript", "react"], "category": "Work", "date": "2025-01-01"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- BLOG yazıları
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('blog-deploy-plesk-bun', 'Plesk + Bun + Next.js: Self-hosted Deploy Hikayesi', 'blog', 'library', 'explorer', 4,
 E'Bu site nasıl yayına çıktı? Plesk panelli bir VPS''e Next.js + Vite uygulamasını adım adım deploy etme deneyimi.\n\n## Sorun\nVercel pahalı + kontrol az. Plesk varken kendi sunucumda neden olmasın?\n\n## Çözüm Yığını\n- **Bun** — npm yerine, hız için\n- **PM2** — Next.js''i sürekli ayakta tutmak için\n- **Plesk reverse proxy** — nginx ayarlarını GUI''den\n- **Subdomain ayrımı** — `mustafakırpık.com` (front) + `admin.mustafakırpık.com` (back)\n\n## Karşılaştığım sorunlar\n- Türkçe karakterli IDN domain (Punycode kullan)\n- Plesk''in "duplicate location" hatası (Proxy mode kapatılmalı)\n- Permission sorunu: klasörler `psaserv`, dosyalar `psacln` group''unda olmalı\n- DNS-01 SSL challenge için subdomain''in NS''lerini parent zone''a yönlendirmek\n\n## Sonuç\nVercel''den daha iyi mi? Bakım maliyeti var ama tam kontrol var.',
 '{"description": "Self-hosted Next.js + Vite deployment deneyimi", "tags": ["nextjs", "plesk", "bun", "deployment", "devops"], "date": "2026-04-27", "category": "DevOps"}'::jsonb),

('blog-knowledge-graph-neden', '[DÜZENLE] Neden Knowledge Graph Portfolyo?', 'blog', 'library', 'explorer', 3,
 'Klasik liste-bazlı portfolyolardan bıktım. İçerik birbirine bağlı ama listede bu görünmüyor. Bu yüzden grafik tabanlı bir portfolyo yaptım.\n\nBu yazıda neden + nasıl tasarladığımı anlatacağım.',
 '{"description": "Portfolyo tasarım kararları", "tags": ["design", "portfolio", "ux"], "date": "2026-04-28", "category": "Design"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- RESOURCE'lar (başkasının iyi şeyleri)
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('resource-theo-t3', 'Theo (t3.gg) — YouTube', 'resource', 'library', 'explorer', 2,
 'Modern web dev içerikleri. T3 stack ile ilgili her şey.',
 '{"description": "Modern web development YouTube kanalı", "link": "https://www.youtube.com/@t3dotgg", "tags": ["youtube", "webdev"], "category": "Video"}'::jsonb),

('resource-fireship', 'Fireship — YouTube', 'resource', 'library', 'explorer', 2,
 '100 saniyede teknoloji açıklamaları. Eğlenceli ve öz.',
 '{"description": "Hızlı teknoloji özetleri", "link": "https://www.youtube.com/@Fireship", "tags": ["youtube", "webdev"], "category": "Video"}'::jsonb),

('resource-drizzle-docs', 'Drizzle ORM Docs', 'resource', 'library', 'explorer', 2,
 'En çok başvurduğum referans. Schema-first örnekler çok iyi.',
 '{"description": "Drizzle ORM resmi dokümanı", "link": "https://orm.drizzle.team/docs/overview", "tags": ["docs", "orm"], "category": "Documentation"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- NOTE'lar (kişisel)
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('note-2026-hedefler', '2026 Hedeflerim', 'note', 'core', 'god_mode', 2,
 E'## Bu yıl yapmak istediklerim\n\n- [ ] Bu portfolyoyu tamamla, içeriği zenginleştir\n- [ ] [DÜZENLE] Hedef 2\n- [ ] [DÜZENLE] Hedef 3',
 '{"description": "Yıllık hedef listesi", "date": "2026-01-01", "category": "Personal"}'::jsonb),

('note-stack-tercihi', 'Neden Bu Stack''i Seçiyorum?', 'note', 'career', 'explorer', 2,
 E'Sürekli aynı stack''i seçmemin sebepleri:\n\n- **TypeScript** → büyük projede refactor güvenliği\n- **Next.js** → SSR + Server Actions birlikte\n- **PostgreSQL** → JSONB ile esneklik + ilişkisel güç\n- **Drizzle** → ORM''den fazla, schema yönetim aracı\n- **Bun** → npm''den çok hızlı, dev experience iyi\n- **Tailwind** → CSS yazmaktan kurtarıyor\n\nHer biri tek başına en iyi değil ama BERABER en az sürtünme.',
 '{"description": "Tech stack tercih sebepleri", "tags": ["tech", "philosophy"], "category": "Career"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- HOBBY'ler — life cluster
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('hobby-reading', '[DÜZENLE] Kitap Okuma', 'hobby', 'life', 'explorer', 2,
 'En çok kurgu-dışı okuyorum. Tech, biyografi, felsefe.',
 '{"description": "Kitap okuma alışkanlığı", "tags": ["reading", "books"], "category": "Hobby"}'::jsonb),

('hobby-music', '[DÜZENLE] Müzik', 'hobby', 'life', 'explorer', 2,
 'Çoğunlukla lo-fi ve rock dinliyorum kod yazarken.',
 '{"description": "Dinlediğim müzikler", "tags": ["music"], "category": "Hobby"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- DATASET'ler
-- ─────────────────────────────────────────────────────────────

INSERT INTO nodes (id, title, type, cluster, visibility, val, content, meta) VALUES
('dataset-stack', 'Aktif Kullandığım Stack', 'dataset', 'career', 'explorer', 3,
 E'2026 itibariyle günlük kullandığım teknolojiler:\n\n**Frontend:** TypeScript, React, Next.js, Vite, Tailwind\n**Backend:** Next.js Server Actions, Drizzle, PostgreSQL\n**Tooling:** Bun, Git, GitHub CLI, VS Code\n**Server:** Ubuntu, Plesk, PM2, nginx\n**DB:** Neon PostgreSQL\n**Hosting:** Self-hosted VPS',
 '{"description": "Günlük tech stack dökümü", "tags": ["stack", "tools"], "category": "Career", "date": "2026-04-27"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- LİNK'ler (bağlantılar)
-- ════════════════════════════════════════════════════════════════

INSERT INTO links (source, target) VALUES
-- About Me bağlantıları
('about-me', 'hub-work'),
('about-me', 'hub-skills'),
('about-me', 'hub-writing'),
('about-me', 'hub-contact'),

-- Hub → child node'lar
('hub-skills', 'skill-typescript'),
('hub-skills', 'skill-react'),
('hub-skills', 'skill-nextjs'),
('hub-skills', 'skill-vite'),
('hub-skills', 'skill-postgresql'),
('hub-skills', 'skill-drizzle'),
('hub-skills', 'skill-tailwind'),
('hub-skills', 'skill-bun'),
('hub-skills', 'skill-linux'),
('hub-skills', 'skill-git'),

('hub-work', 'project-digital-brain'),
('hub-work', 'project-erkpa'),

('hub-writing', 'blog-deploy-plesk-bun'),
('hub-writing', 'blog-knowledge-graph-neden'),
('hub-writing', 'note-stack-tercihi'),

-- Project → kullanılan skill'ler
('project-digital-brain', 'skill-typescript'),
('project-digital-brain', 'skill-react'),
('project-digital-brain', 'skill-nextjs'),
('project-digital-brain', 'skill-vite'),
('project-digital-brain', 'skill-postgresql'),
('project-digital-brain', 'skill-drizzle'),
('project-digital-brain', 'skill-tailwind'),
('project-digital-brain', 'skill-bun'),
('project-digital-brain', 'skill-linux'),

-- Blog → bahsettiği skill/resource'lar
('blog-deploy-plesk-bun', 'skill-nextjs'),
('blog-deploy-plesk-bun', 'skill-bun'),
('blog-deploy-plesk-bun', 'skill-linux'),
('blog-deploy-plesk-bun', 'project-digital-brain'),

('blog-knowledge-graph-neden', 'project-digital-brain'),

-- Note → ilgili skill/dataset'ler
('note-stack-tercihi', 'dataset-stack'),
('note-stack-tercihi', 'skill-typescript'),
('note-stack-tercihi', 'skill-nextjs'),

-- Resource → bahsettikleri konu
('resource-drizzle-docs', 'skill-drizzle')

ON CONFLICT (source, target) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- Bu dosya bittiğinde Neon SQL Editor'da AYRI bir query olarak
-- aşağıdakileri tek tek çalıştırarak doğrulayabilirsin:
-- ════════════════════════════════════════════════════════════════

-- SELECT (SELECT COUNT(*) FROM nodes) AS toplam_node, (SELECT COUNT(*) FROM links) AS toplam_link;
-- SELECT type, COUNT(*) FROM nodes GROUP BY type ORDER BY COUNT(*) DESC;
-- SELECT visibility, COUNT(*) FROM nodes GROUP BY visibility;
