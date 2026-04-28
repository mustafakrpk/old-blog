import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { nodes, links } from "../src/db/schema"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ════════════════════════════════════════════════════════════════
// Mustafa Kırpık — Kişisel Node Seed (TypeScript)
// ════════════════════════════════════════════════════════════════
// Çalıştır:
//   cd /var/www/digital-brain/back
//   bun scripts/seed-personal.ts
// ════════════════════════════════════════════════════════════════

const personalNodes: Array<{
	id: string
	title: string
	type: "hub" | "project" | "skill" | "blog" | "note" | "resource" | "hobby" | "dataset"
	cluster: "core" | "career" | "library" | "playground" | "life"
	visibility: "professional" | "explorer" | "god_mode"
	val: number
	content: string | null
	meta: Record<string, unknown> | null
}> = [
	// ── ABOUT ME (merkez node) ──
	{
		id: "about-me",
		title: "About Me",
		type: "hub",
		cluster: "core",
		visibility: "professional",
		val: 8,
		content: `# Mustafa Kırpık

Merhaba! Ben yazılım geliştirici. Bu site benim digital garden'ım — projelerim, yetenekler ve düşüncelerim arasındaki bağlantıları interaktif bir grafik olarak görebilirsin.

## Şu an ne yapıyorum?
- [DÜZENLE] Şu an hangi projedesin
- Bu portfolyoyu geliştiriyorum

## Beni nasıl kullanırsın?
- Bir node'a tıkla → detay açılır
- Search bar (\`/\`) ile ara
- Mode switcher ile farklı görünümler

## İletişim
- E-posta: [DÜZENLE]
- GitHub: [github.com/mustafakrpk](https://github.com/mustafakrpk)`,
		meta: { description: "Bu graph'ın merkezi", category: "Personal", date: "2026-04-28" },
	},

	// ── HUB'lar ──
	{
		id: "hub-work",
		title: "Çalıştığım İşler",
		type: "hub",
		cluster: "career",
		visibility: "professional",
		val: 5,
		content: "Profesyonel projelerim ve iş deneyimim.",
		meta: { description: "Tüm iş deneyimim ve projelerim", category: "Career" },
	},
	{
		id: "hub-skills",
		title: "Yeteneklerim",
		type: "hub",
		cluster: "career",
		visibility: "professional",
		val: 5,
		content: "Bildiğim ve aktif kullandığım teknolojiler.",
		meta: { description: "Teknik yetenek seti", category: "Career" },
	},
	{
		id: "hub-writing",
		title: "Yazılarım",
		type: "hub",
		cluster: "library",
		visibility: "explorer",
		val: 5,
		content: "Blog yazıları, notlar, deneyimler.",
		meta: { description: "Yazdığım her şey", category: "Library" },
	},
	{
		id: "hub-contact",
		title: "İletişim",
		type: "hub",
		cluster: "core",
		visibility: "professional",
		val: 4,
		content: "Bana ulaşmak için: e-posta, GitHub, LinkedIn",
		meta: { description: "İletişim bilgileri", link: "mailto:e.turgut@erkpa.com.tr" },
	},

	// ── SKILL'ler ──
	{
		id: "skill-typescript",
		title: "TypeScript",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 4,
		content: "Frontend ve backend tarafında günlük kullanım. Strict mode tercih ederim.",
		meta: { description: "Type-safe JavaScript", tags: ["frontend", "backend", "language"], category: "Programming" },
	},
	{
		id: "skill-react",
		title: "React",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 4,
		content: "React 18/19 ile component-based UI geliştirme. Hooks, Server Components.",
		meta: { description: "UI library", tags: ["frontend", "ui"], category: "Frontend" },
	},
	{
		id: "skill-nextjs",
		title: "Next.js",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 4,
		content: "App Router, Server Actions, ISR — full-stack React framework.",
		meta: {
			description: "Full-stack React framework",
			tags: ["frontend", "backend", "ssr"],
			category: "Frontend",
			link: "https://nextjs.org",
		},
	},
	{
		id: "skill-vite",
		title: "Vite",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Hızlı dev server + production build. SPA ve library projelerinde tercih.",
		meta: { description: "Build tool", tags: ["build", "frontend"], category: "Tooling" },
	},
	{
		id: "skill-postgresql",
		title: "PostgreSQL",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 4,
		content: "İlişkisel DB. JSONB, full-text search, window functions.",
		meta: { description: "Relational database", tags: ["database", "sql"], category: "Backend" },
	},
	{
		id: "skill-drizzle",
		title: "Drizzle ORM",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Type-safe ORM. Schema-first yaklaşım, migration sistemi temiz.",
		meta: {
			description: "TypeScript ORM",
			tags: ["database", "orm"],
			category: "Backend",
			link: "https://orm.drizzle.team",
		},
	},
	{
		id: "skill-tailwind",
		title: "Tailwind CSS",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Utility-first CSS. Tailwind v4 ile birlikte design system kuruyorum.",
		meta: { description: "Utility-first CSS framework", tags: ["css", "frontend"], category: "Frontend" },
	},
	{
		id: "skill-bun",
		title: "Bun",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Hızlı JS runtime + package manager. npm/yarn yerine bun tercih ediyorum.",
		meta: {
			description: "JavaScript runtime",
			tags: ["runtime", "tooling"],
			category: "Tooling",
			link: "https://bun.sh",
		},
	},
	{
		id: "skill-linux",
		title: "Linux & Server Admin",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Ubuntu sunucu yönetimi, Plesk, nginx, PM2, systemd.",
		meta: { description: "Server operations", tags: ["devops", "linux"], category: "DevOps" },
	},
	{
		id: "skill-git",
		title: "Git",
		type: "skill",
		cluster: "career",
		visibility: "professional",
		val: 3,
		content: "Branch stratejileri, rebase workflow, GitHub CLI.",
		meta: { description: "Version control", tags: ["devops", "git"], category: "Tooling" },
	},

	// ── PROJECT'ler ──
	{
		id: "project-digital-brain",
		title: "Digital Garden — bu site",
		type: "project",
		cluster: "career",
		visibility: "professional",
		val: 5,
		content: `Görüyorsun ya, içindesin :)

Kişisel bilgi grafiği projesi. Ziyaretçi liste yerine **interaktif bir grafik** üzerinde geziniyor.

## Stack
- **Frontend:** Vite + React + react-force-graph
- **Admin:** Next.js 16 (App Router, Server Actions)
- **DB:** Neon PostgreSQL + Drizzle ORM
- **Server:** Plesk + PM2 + nginx

## Özellikler
- 8 farklı node tipi (hub, project, skill, blog, ...)
- 5 cluster (career, library, playground, ...)
- 3 visibility seviyesi (public/explorer/private)
- Admin panel ile içerik yönetimi`,
		meta: {
			description: "Kişisel knowledge graph + portfolyo",
			tags: ["nextjs", "react", "vite", "postgresql"],
			link: "https://github.com/mustafakrpk/old-blog",
			category: "Personal Project",
			date: "2026-04-21",
		},
	},
	{
		id: "project-erkpa",
		title: "[DÜZENLE] Erkpa İş Projesi",
		type: "project",
		cluster: "career",
		visibility: "professional",
		val: 4,
		content:
			"Erkpa'da çalıştığım proje hakkında bilgi. Sorumluluklar, kullanılan teknolojiler, başardıkların.",
		meta: { description: "Şirket projesi", tags: ["typescript", "react"], category: "Work", date: "2025-01-01" },
	},

	// ── BLOG yazıları ──
	{
		id: "blog-deploy-plesk-bun",
		title: "Plesk + Bun + Next.js: Self-hosted Deploy Hikayesi",
		type: "blog",
		cluster: "library",
		visibility: "explorer",
		val: 4,
		content: `Bu site nasıl yayına çıktı? Plesk panelli bir VPS'e Next.js + Vite uygulamasını adım adım deploy etme deneyimi.

## Sorun
Vercel pahalı + kontrol az. Plesk varken kendi sunucumda neden olmasın?

## Çözüm Yığını
- **Bun** — npm yerine, hız için
- **PM2** — Next.js'i sürekli ayakta tutmak için
- **Plesk reverse proxy** — nginx ayarlarını GUI'den
- **Subdomain ayrımı** — \`mustafakırpık.com\` (front) + \`admin.mustafakırpık.com\` (back)

## Karşılaştığım sorunlar
- Türkçe karakterli IDN domain (Punycode kullan)
- Plesk'in "duplicate location" hatası (Proxy mode kapatılmalı)
- Permission sorunu: klasörler \`psaserv\`, dosyalar \`psacln\` group'unda olmalı
- DNS-01 SSL challenge için subdomain'in NS'lerini parent zone'a yönlendirmek

## Sonuç
Vercel'den daha iyi mi? Bakım maliyeti var ama tam kontrol var.`,
		meta: {
			description: "Self-hosted Next.js + Vite deployment deneyimi",
			tags: ["nextjs", "plesk", "bun", "deployment", "devops"],
			date: "2026-04-27",
			category: "DevOps",
		},
	},
	{
		id: "blog-knowledge-graph-neden",
		title: "[DÜZENLE] Neden Knowledge Graph Portfolyo?",
		type: "blog",
		cluster: "library",
		visibility: "explorer",
		val: 3,
		content:
			"Klasik liste-bazlı portfolyolardan bıktım. İçerik birbirine bağlı ama listede bu görünmüyor. Bu yüzden grafik tabanlı bir portfolyo yaptım.\n\nBu yazıda neden + nasıl tasarladığımı anlatacağım.",
		meta: {
			description: "Portfolyo tasarım kararları",
			tags: ["design", "portfolio", "ux"],
			date: "2026-04-28",
			category: "Design",
		},
	},

	// ── RESOURCE'lar ──
	{
		id: "resource-theo-t3",
		title: "Theo (t3.gg) — YouTube",
		type: "resource",
		cluster: "library",
		visibility: "explorer",
		val: 2,
		content: "Modern web dev içerikleri. T3 stack ile ilgili her şey.",
		meta: {
			description: "Modern web development YouTube kanalı",
			link: "https://www.youtube.com/@t3dotgg",
			tags: ["youtube", "webdev"],
			category: "Video",
		},
	},
	{
		id: "resource-fireship",
		title: "Fireship — YouTube",
		type: "resource",
		cluster: "library",
		visibility: "explorer",
		val: 2,
		content: "100 saniyede teknoloji açıklamaları. Eğlenceli ve öz.",
		meta: {
			description: "Hızlı teknoloji özetleri",
			link: "https://www.youtube.com/@Fireship",
			tags: ["youtube", "webdev"],
			category: "Video",
		},
	},
	{
		id: "resource-drizzle-docs",
		title: "Drizzle ORM Docs",
		type: "resource",
		cluster: "library",
		visibility: "explorer",
		val: 2,
		content: "En çok başvurduğum referans. Schema-first örnekler çok iyi.",
		meta: {
			description: "Drizzle ORM resmi dokümanı",
			link: "https://orm.drizzle.team/docs/overview",
			tags: ["docs", "orm"],
			category: "Documentation",
		},
	},

	// ── NOTE'lar ──
	{
		id: "note-2026-hedefler",
		title: "2026 Hedeflerim",
		type: "note",
		cluster: "core",
		visibility: "god_mode",
		val: 2,
		content: `## Bu yıl yapmak istediklerim

- [ ] Bu portfolyoyu tamamla, içeriği zenginleştir
- [ ] [DÜZENLE] Hedef 2
- [ ] [DÜZENLE] Hedef 3`,
		meta: { description: "Yıllık hedef listesi", date: "2026-01-01", category: "Personal" },
	},
	{
		id: "note-stack-tercihi",
		title: "Neden Bu Stack'i Seçiyorum?",
		type: "note",
		cluster: "career",
		visibility: "explorer",
		val: 2,
		content: `Sürekli aynı stack'i seçmemin sebepleri:

- **TypeScript** → büyük projede refactor güvenliği
- **Next.js** → SSR + Server Actions birlikte
- **PostgreSQL** → JSONB ile esneklik + ilişkisel güç
- **Drizzle** → ORM'den fazla, schema yönetim aracı
- **Bun** → npm'den çok hızlı, dev experience iyi
- **Tailwind** → CSS yazmaktan kurtarıyor

Her biri tek başına en iyi değil ama BERABER en az sürtünme.`,
		meta: { description: "Tech stack tercih sebepleri", tags: ["tech", "philosophy"], category: "Career" },
	},

	// ── HOBBY'ler ──
	{
		id: "hobby-reading",
		title: "[DÜZENLE] Kitap Okuma",
		type: "hobby",
		cluster: "life",
		visibility: "explorer",
		val: 2,
		content: "En çok kurgu-dışı okuyorum. Tech, biyografi, felsefe.",
		meta: { description: "Kitap okuma alışkanlığı", tags: ["reading", "books"], category: "Hobby" },
	},
	{
		id: "hobby-music",
		title: "[DÜZENLE] Müzik",
		type: "hobby",
		cluster: "life",
		visibility: "explorer",
		val: 2,
		content: "Çoğunlukla lo-fi ve rock dinliyorum kod yazarken.",
		meta: { description: "Dinlediğim müzikler", tags: ["music"], category: "Hobby" },
	},

	// ── DATASET ──
	{
		id: "dataset-stack",
		title: "Aktif Kullandığım Stack",
		type: "dataset",
		cluster: "career",
		visibility: "explorer",
		val: 3,
		content: `2026 itibariyle günlük kullandığım teknolojiler:

**Frontend:** TypeScript, React, Next.js, Vite, Tailwind
**Backend:** Next.js Server Actions, Drizzle, PostgreSQL
**Tooling:** Bun, Git, GitHub CLI, VS Code
**Server:** Ubuntu, Plesk, PM2, nginx
**DB:** Neon PostgreSQL
**Hosting:** Self-hosted VPS`,
		meta: {
			description: "Günlük tech stack dökümü",
			tags: ["stack", "tools"],
			category: "Career",
			date: "2026-04-27",
		},
	},
]

const personalLinks: Array<{ source: string; target: string }> = [
	// About Me bağlantıları
	{ source: "about-me", target: "hub-work" },
	{ source: "about-me", target: "hub-skills" },
	{ source: "about-me", target: "hub-writing" },
	{ source: "about-me", target: "hub-contact" },

	// Hub → child
	{ source: "hub-skills", target: "skill-typescript" },
	{ source: "hub-skills", target: "skill-react" },
	{ source: "hub-skills", target: "skill-nextjs" },
	{ source: "hub-skills", target: "skill-vite" },
	{ source: "hub-skills", target: "skill-postgresql" },
	{ source: "hub-skills", target: "skill-drizzle" },
	{ source: "hub-skills", target: "skill-tailwind" },
	{ source: "hub-skills", target: "skill-bun" },
	{ source: "hub-skills", target: "skill-linux" },
	{ source: "hub-skills", target: "skill-git" },

	{ source: "hub-work", target: "project-digital-brain" },
	{ source: "hub-work", target: "project-erkpa" },

	{ source: "hub-writing", target: "blog-deploy-plesk-bun" },
	{ source: "hub-writing", target: "blog-knowledge-graph-neden" },
	{ source: "hub-writing", target: "note-stack-tercihi" },

	// Project → skill
	{ source: "project-digital-brain", target: "skill-typescript" },
	{ source: "project-digital-brain", target: "skill-react" },
	{ source: "project-digital-brain", target: "skill-nextjs" },
	{ source: "project-digital-brain", target: "skill-vite" },
	{ source: "project-digital-brain", target: "skill-postgresql" },
	{ source: "project-digital-brain", target: "skill-drizzle" },
	{ source: "project-digital-brain", target: "skill-tailwind" },
	{ source: "project-digital-brain", target: "skill-bun" },
	{ source: "project-digital-brain", target: "skill-linux" },

	// Blog → skill/project
	{ source: "blog-deploy-plesk-bun", target: "skill-nextjs" },
	{ source: "blog-deploy-plesk-bun", target: "skill-bun" },
	{ source: "blog-deploy-plesk-bun", target: "skill-linux" },
	{ source: "blog-deploy-plesk-bun", target: "project-digital-brain" },
	{ source: "blog-knowledge-graph-neden", target: "project-digital-brain" },

	// Note → ilgili
	{ source: "note-stack-tercihi", target: "dataset-stack" },
	{ source: "note-stack-tercihi", target: "skill-typescript" },
	{ source: "note-stack-tercihi", target: "skill-nextjs" },

	// Resource → konu
	{ source: "resource-drizzle-docs", target: "skill-drizzle" },
]

async function seedPersonal() {
	console.log("🌱 Kişisel seed başlıyor...\n")

	console.log(`→ ${personalNodes.length} node ekleniyor...`)
	for (const node of personalNodes) {
		await db.insert(nodes).values(node).onConflictDoNothing()
		console.log(`  ✓ ${node.id}`)
	}

	console.log(`\n→ ${personalLinks.length} link ekleniyor...`)
	let linkCount = 0
	for (const link of personalLinks) {
		try {
			await db.insert(links).values(link).onConflictDoNothing()
			linkCount++
		} catch (err) {
			console.log(`  ✗ ${link.source} → ${link.target} (atlandı: ${(err as Error).message.slice(0, 60)})`)
		}
	}
	console.log(`  ✓ ${linkCount}/${personalLinks.length} link eklendi`)

	console.log("\n✓ Bitti!")
}

seedPersonal().catch((err) => {
	console.error("Hata:", err)
	process.exit(1)
})
