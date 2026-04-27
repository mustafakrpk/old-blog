import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { nodes, links } from "../src/db/schema"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ── Category → Cluster mapping ──
const CATEGORY_TO_CLUSTER: Record<string, "core" | "career" | "library" | "playground" | "life"> = {
	Core: "core",
	"Web Development": "career",
	Backend: "career",
	DevOps: "career",
	"AI & Data": "career",
	Design: "library",
	Writing: "library",
	"Mobile & Apps": "playground",
	Life: "life",
}

// ── Type mapping (old → new) ──
function mapType(type: string): "hub" | "project" | "skill" | "blog" | "note" | "resource" | "hobby" | "dataset" {
	if (type === "about") return "note"
	return type as "hub" | "project" | "skill" | "blog"
}

// ── Visibility mapping ──
function mapVisibility(type: string, isKeyword: boolean): "professional" | "explorer" | "god_mode" {
	if (isKeyword) return "god_mode"
	if (type === "blog") return "explorer"
	return "professional"
}

// ── Base nodes (same as contentData.ts) ──
const baseNodes = [
	{ id: "me", title: "Mustafa Kirpik", type: "hub", category: "Core", description: "Developer, writer, builder.", val: 10, content: "# Hey, I'm Mustafa\n\nI build things for the web. I write about what I learn. This is my corner of the internet — a living, breathing knowledge graph of everything I'm working on and thinking about.\n\n**Navigate** by clicking nodes or searching above. Each node is a blog post, project, or skill.\n\nWelcome to my universe." },
	{ id: "about", title: "About Me", type: "about", category: "Core", description: "Who I am, what I do.", val: 5, content: "# About Me\n\nI'm a developer passionate about building beautiful, functional web experiences.\n\n## What I Do\n- Full-stack web development\n- UI/UX design with a focus on dark, immersive interfaces\n- Open source contributions\n\n## Currently\n- Exploring 3D web experiences and data visualization\n- Writing about software architecture and developer experience\n- Building tools that help people learn\n\n## Contact\n- GitHub: [github.com](#)\n- Twitter: [twitter.com](#)\n- Email: hello@example.com" },
	{ id: "uses", title: "My Setup & Tools", type: "about", category: "Core", description: "Hardware, software, and tools I use daily.", val: 3, content: "# My Setup\n\n## Editor\n- **VS Code** with Vim keybindings\n- Theme: One Dark Pro\n- Font: JetBrains Mono\n\n## Terminal\n- Windows Terminal + PowerShell\n- Oh My Posh for prompt\n\n## Hardware\n- Custom PC build\n- Dual monitor setup\n- Mechanical keyboard\n\n## Stack\n- TypeScript everywhere\n- React + Vite for frontend\n- Node.js / Bun for backend\n- Tailwind CSS for styling" },
	{ id: "proj-knowledge-graph", title: "Knowledge Graph", type: "project", category: "Web Development", description: "3D interactive knowledge graph — this very site.", date: "2025-01", tags: ["React", "Three.js", "TypeScript", "Vite"], link: "#", val: 6, content: "# Knowledge Graph\n\nThis is the project you're looking at right now. A 3D interactive knowledge graph that serves as my blog and portfolio.\n\n## Tech Stack\n- **React 18** with TypeScript\n- **react-force-graph-3d** for 3D visualization\n- **Three.js** under the hood\n- **Vite** for blazing fast builds\n- **Tailwind CSS** for styling\n\n## Features\n- 3D force-directed graph with physics simulation\n- Glassmorphism search overlay\n- Click-to-focus camera animation\n- Slide-in content panels\n- Fully responsive\n\n## Why?\nBecause static portfolio sites are boring. I wanted something that shows how ideas connect — a living map of my work." },
	{ id: "proj-cli-tool", title: "DevFlow CLI", type: "project", category: "Backend", description: "A CLI tool for automating dev workflows.", date: "2024-11", tags: ["Rust", "CLI", "Automation"], link: "#", val: 4, content: "# DevFlow CLI\n\nA command-line tool that automates repetitive development workflows.\n\n## What it does\n- Scaffolds new projects with templates\n- Runs pre-configured build pipelines\n- Manages environment variables across projects\n- Git workflow automation (branch naming, commit messages)\n\n## Built with\n- **Rust** for performance\n- **clap** for argument parsing\n- **tokio** for async operations\n\n## Installation\n```bash\ncargo install devflow\n```" },
	{ id: "proj-ai-chat", title: "AI Chat Interface", type: "project", category: "AI & Data", description: "A beautiful chat UI for LLM interactions.", date: "2025-01", tags: ["React", "OpenAI", "Streaming", "TypeScript"], val: 5, content: "# AI Chat Interface\n\nA minimal, beautiful chat interface for interacting with large language models.\n\n## Features\n- Streaming token-by-token responses\n- Markdown rendering in messages\n- Code syntax highlighting\n- Conversation history with local storage\n- Dark mode by default\n\n## Stack\n- React + TypeScript\n- OpenAI API with streaming\n- Tailwind CSS\n- Framer Motion for animations" },
	{ id: "proj-task-app", title: "Taskflow", type: "project", category: "Mobile & Apps", description: "A minimalist task management app.", date: "2024-08", tags: ["React Native", "TypeScript", "SQLite"], val: 4, content: "# Taskflow\n\nA minimalist task management app that focuses on what matters.\n\n## Philosophy\nNo bloat. No gamification. Just your tasks, organized simply.\n\n## Features\n- Drag and drop reordering\n- Natural language date parsing\n- Offline-first with SQLite\n- Widget support\n\n## Built with\n- React Native\n- TypeScript\n- SQLite for local storage\n- Expo for deployment" },
	{ id: "proj-api-gateway", title: "Edge API Gateway", type: "project", category: "Backend", description: "A lightweight API gateway running at the edge.", date: "2024-06", tags: ["Go", "Cloudflare Workers", "API"], val: 4, content: "# Edge API Gateway\n\nA lightweight API gateway designed to run at the edge for minimal latency.\n\n## Features\n- Request routing and load balancing\n- Rate limiting per API key\n- JWT validation at the edge\n- Request/response transformation\n- Built-in analytics\n\n## Tech\n- **Go** core logic\n- Deployable to **Cloudflare Workers**\n- Sub-millisecond routing decisions" },
	{ id: "blog-why-3d", title: "Why I Built a 3D Portfolio", type: "blog", category: "Writing", description: "The story behind this unconventional portfolio site.", date: "2025-01-15", tags: ["portfolio", "3D", "creativity"], val: 3, content: "# Why I Built a 3D Portfolio\n\nMost portfolio sites are the same: a hero section, an about section, a grid of projects. Clean, professional, forgettable.\n\nI wanted something different. Something that reflects how I actually think — not in neat rows, but in **connections**.\n\n## The Idea\n\nEvery project I build connects to skills I've learned. Every blog post references tools I use. My knowledge isn't a list — it's a **graph**.\n\nSo I built my portfolio as a 3D knowledge graph. Each node is a piece of content. Each link shows a relationship. You can orbit around it, zoom in, click, explore.\n\n## Is it Practical?\n\nHonestly? It's harder to navigate than a normal site. But that's not the point. The point is that it's **memorable**. And in a sea of identical portfolios, being memorable matters.\n\n## The Tech\n\n- react-force-graph-3d for the 3D rendering\n- Three.js under the hood\n- d3-force-3d for the physics simulation\n- Custom glassmorphism UI on top\n\nIt was a fun build. And it's mine." },
	{ id: "blog-typescript-tricks", title: "TypeScript Tricks I Use Daily", type: "blog", category: "Web Development", description: "Practical TypeScript patterns for real-world code.", date: "2025-01-10", tags: ["TypeScript", "tips", "patterns"], val: 3, content: "# TypeScript Tricks I Use Daily\n\nAfter years of TypeScript, these are the patterns I reach for most.\n\n## 1. Discriminated Unions\n\n```typescript\ntype Result<T> =\n  | { ok: true; data: T }\n  | { ok: false; error: string }\n```\n\n## 2. `satisfies` Operator\n\n```typescript\nconst config = {\n  port: 3000,\n  host: \"localhost\",\n} satisfies ServerConfig\n```\n\n## 3. Template Literal Types\n\n```typescript\ntype EventName = `on${Capitalize<string>}`\n```\n\n## 4. Const Assertions\n\n```typescript\nconst ROUTES = [\"home\", \"about\", \"blog\"] as const\ntype Route = (typeof ROUTES)[number]\n```\n\nThese patterns eliminate entire categories of bugs. Use them." },
	{ id: "blog-rust-journey", title: "My Rust Journey: 6 Months In", type: "blog", category: "Writing", description: "What I've learned after 6 months of writing Rust.", date: "2024-12-20", tags: ["Rust", "learning", "systems"], val: 3, content: "# My Rust Journey: 6 Months In\n\nSix months ago I wrote my first line of Rust. Here's what I've learned.\n\n## The Borrow Checker is Your Friend\n\nYes, it's frustrating at first. But once you internalize ownership, your code becomes bulletproof. No null pointer exceptions. No data races. Ever.\n\n## Cargo is Best-in-Class\n\nComing from npm/yarn, Cargo feels like a breath of fresh air. Build, test, lint, publish — all one tool, all fast.\n\n## The Community is Great\n\nThe Rust community is incredibly helpful. The compiler error messages are actually useful. The documentation is thorough.\n\n## What I Built\n\n- A CLI tool (devflow)\n- A web scraper\n- A simple HTTP server\n- Currently: a Markdown parser\n\n## Would I Recommend It?\n\nAbsolutely. Even if you never use Rust professionally, learning it makes you a better programmer in every language." },
	{ id: "blog-vite-deep", title: "Vite Deep Dive", type: "blog", category: "Web Development", description: "Understanding how Vite works under the hood.", date: "2024-11-15", tags: ["Vite", "bundler", "DX"], val: 3, content: "# Vite Deep Dive\n\nVite changed how I think about frontend tooling. Here's how it actually works.\n\n## Dev Server: Native ESM\n\nIn development, Vite serves files as native ES modules. No bundling. The browser does the module resolution. This is why it starts instantly.\n\n## HMR: Surgical Updates\n\nWhen you edit a file, Vite only invalidates that exact module and its importers. No full-page reload. Changes appear in milliseconds.\n\n## Production: Rollup\n\nFor production, Vite uses Rollup to create optimized bundles. Tree shaking, code splitting, minification — all handled.\n\n## Why It Matters\n\nDeveloper experience matters. A tool that's fast enough to disappear from your workflow lets you focus on building, not waiting." },
	{ id: "blog-dark-ui", title: "Designing Dark UIs That Don't Suck", type: "blog", category: "Design", description: "Principles for effective dark mode design.", date: "2024-10-20", tags: ["design", "UI", "dark mode"], val: 3, content: "# Designing Dark UIs That Don't Suck\n\nDark mode isn't just inverting colors. Here's how to do it right.\n\n## Don't Use Pure Black\n\n`#000000` is too harsh. Use dark grays like `#0a0a0f` or `#111118`. Add a subtle blue or purple tint for depth.\n\n## Reduce Contrast, Don't Eliminate It\n\nWhite text on dark backgrounds should be `rgba(255,255,255,0.85)`, not pure `#fff`. Reserve pure white for emphasis.\n\n## Use Elevation with Opacity\n\nInstead of shadows (which disappear on dark backgrounds), use lighter surface colors for elevated elements. `bg-white/5` → `bg-white/10` → `bg-white/15`.\n\n## Glassmorphism Works\n\nBackdrop blur + semi-transparent backgrounds look stunning on dark themes. Use `backdrop-blur-xl` with `bg-white/[0.05]`.\n\n## Color Should Pop\n\nOn dark backgrounds, accent colors appear more vibrant. Use this to your advantage. Let your brand colors shine." },
	{ id: "skill-react", title: "React", type: "skill", category: "Web Development", description: "Component-based UI library.", tags: ["frontend", "library"], val: 3, content: "# React\n\nMy primary frontend framework. I've been using React since 2020.\n\n## What I Use\n- Hooks (useState, useEffect, useMemo, useCallback, useRef)\n- Context API for light state management\n- Server Components (exploring)\n- React Router for navigation\n\n## Libraries I Pair With\n- Tailwind CSS\n- Zustand / Valtio for state\n- React Query for data fetching\n- Framer Motion for animation" },
	{ id: "skill-typescript", title: "TypeScript", type: "skill", category: "Web Development", description: "Typed JavaScript at scale.", tags: ["language", "frontend", "backend"], val: 3, content: "# TypeScript\n\nTypeScript is my default for all JavaScript projects.\n\n## Proficiency\n- Advanced type system (generics, mapped types, conditional types)\n- Strict mode always on\n- Declaration file authoring\n- Compiler API basics" },
	{ id: "skill-rust", title: "Rust", type: "skill", category: "Backend", description: "Systems programming language.", tags: ["language", "systems"], val: 3 },
	{ id: "skill-go", title: "Go", type: "skill", category: "Backend", description: "Fast, concurrent, simple.", tags: ["language", "backend"], val: 2 },
	{ id: "skill-threejs", title: "Three.js", type: "skill", category: "Web Development", description: "3D graphics in the browser.", tags: ["3D", "graphics", "frontend"], val: 2 },
	{ id: "skill-tailwind", title: "Tailwind CSS", type: "skill", category: "Design", description: "Utility-first CSS framework.", tags: ["CSS", "styling"], val: 2 },
	{ id: "skill-docker", title: "Docker", type: "skill", category: "DevOps", description: "Containerization platform.", tags: ["devops", "containers"], val: 2 },
	{ id: "skill-figma", title: "Figma", type: "skill", category: "Design", description: "UI design tool.", tags: ["design", "UI"], val: 2 },
	{ id: "skill-node", title: "Node.js", type: "skill", category: "Backend", description: "JavaScript runtime for the server.", tags: ["runtime", "backend"], val: 2 },
	{ id: "skill-python", title: "Python", type: "skill", category: "AI & Data", description: "Data science and scripting.", tags: ["language", "data"], val: 2 },
	{ id: "skill-git", title: "Git", type: "skill", category: "DevOps", description: "Version control.", tags: ["devops", "workflow"], val: 2 },
]

// ── Base links ──
const baseLinks = [
	{ source: "me", target: "about" },
	{ source: "me", target: "uses" },
	{ source: "me", target: "proj-knowledge-graph" },
	{ source: "me", target: "proj-cli-tool" },
	{ source: "me", target: "proj-ai-chat" },
	{ source: "me", target: "proj-task-app" },
	{ source: "me", target: "proj-api-gateway" },
	{ source: "me", target: "blog-why-3d" },
	{ source: "me", target: "blog-typescript-tricks" },
	{ source: "me", target: "blog-rust-journey" },
	{ source: "me", target: "blog-vite-deep" },
	{ source: "me", target: "blog-dark-ui" },
	{ source: "proj-knowledge-graph", target: "skill-react" },
	{ source: "proj-knowledge-graph", target: "skill-typescript" },
	{ source: "proj-knowledge-graph", target: "skill-threejs" },
	{ source: "proj-knowledge-graph", target: "skill-tailwind" },
	{ source: "proj-cli-tool", target: "skill-rust" },
	{ source: "proj-ai-chat", target: "skill-react" },
	{ source: "proj-ai-chat", target: "skill-typescript" },
	{ source: "proj-ai-chat", target: "skill-python" },
	{ source: "proj-task-app", target: "skill-react" },
	{ source: "proj-task-app", target: "skill-typescript" },
	{ source: "proj-api-gateway", target: "skill-go" },
	{ source: "proj-api-gateway", target: "skill-docker" },
	{ source: "blog-why-3d", target: "proj-knowledge-graph" },
	{ source: "blog-why-3d", target: "skill-threejs" },
	{ source: "blog-typescript-tricks", target: "skill-typescript" },
	{ source: "blog-rust-journey", target: "skill-rust" },
	{ source: "blog-rust-journey", target: "proj-cli-tool" },
	{ source: "blog-vite-deep", target: "skill-react" },
	{ source: "blog-dark-ui", target: "skill-tailwind" },
	{ source: "blog-dark-ui", target: "skill-figma" },
	{ source: "skill-react", target: "skill-typescript" },
	{ source: "skill-react", target: "skill-tailwind" },
	{ source: "skill-react", target: "skill-node" },
	{ source: "skill-typescript", target: "skill-node" },
	{ source: "skill-rust", target: "skill-go" },
	{ source: "skill-docker", target: "skill-git" },
	{ source: "skill-python", target: "skill-node" },
	{ source: "about", target: "skill-react" },
	{ source: "about", target: "skill-rust" },
	{ source: "uses", target: "skill-typescript" },
	{ source: "uses", target: "skill-git" },
	{ source: "uses", target: "skill-docker" },
]

// ── Keyword expansion ──
const keywordMap: Record<string, string[]> = {
	"skill-react": ["Hooks", "JSX", "Virtual DOM", "Context API", "Suspense", "Server Components", "React Router", "Redux", "Zustand", "React Query", "Error Boundaries", "Portals", "Refs", "Memoization", "Fiber", "Concurrent Mode", "Hydration", "Code Splitting", "Lazy Loading"],
	"skill-typescript": ["Generics", "Utility Types", "Type Guards", "Mapped Types", "Enums", "Decorators", "Declaration Files", "Strict Mode", "Conditional Types", "Template Literals", "Discriminated Unions", "Type Inference", "Compiler API", "satisfies", "Branded Types", "Infer Keyword"],
	"skill-rust": ["Ownership", "Borrowing", "Lifetimes", "Traits", "Pattern Matching", "Cargo", "Tokio", "Serde", "Macros", "Error Handling", "Unsafe Rust", "FFI", "WebAssembly", "Actix Web", "Embedded"],
	"skill-go": ["Goroutines", "Channels", "Interfaces", "Go Modules", "Error Handling", "Gin", "Context Package", "Testing", "Concurrency", "Reflection", "Generics", "Build Tags", "Profiling"],
	"skill-threejs": ["Scene", "Camera", "Renderer", "Mesh", "Geometry", "Materials", "Lighting", "Shadows", "Raycasting", "Post Processing", "Shaders", "GLSL", "OrbitControls", "Textures", "Animation Loop"],
	"skill-tailwind": ["Utility Classes", "Responsive Design", "Dark Mode", "Plugins", "Arbitrary Values", "JIT Compiler", "Customization", "Preflight", "Container Queries", "Animations", "Transitions"],
	"skill-docker": ["Dockerfile", "Compose", "Volumes", "Networks", "Images", "Containers", "Registry", "Multi-stage Builds", "Health Checks", "Swarm", "Overlay Network", "Secrets"],
	"skill-node": ["Express.js", "Fastify", "Event Loop", "Streams", "Cluster", "Worker Threads", "NPM", "Middleware", "File System", "Buffers", "Child Processes", "REPL", "ESM Modules"],
	"skill-python": ["NumPy", "Pandas", "FastAPI", "Django", "Flask", "Asyncio", "Decorators", "Type Hints", "Poetry", "Pydantic", "SQLAlchemy", "Celery", "Jupyter", "pytest"],
	"skill-figma": ["Components", "Auto Layout", "Variants", "Prototyping", "Design Tokens", "Plugins", "Grids", "Typography", "Color Styles"],
	"skill-git": ["Branching", "Merging", "Rebasing", "Cherry Pick", "Stash", "Hooks", "Submodules", "Bisect", "Reflog", "Worktrees"],
	"proj-knowledge-graph": ["Force Layout", "d3-force", "3D Rendering", "WebGL", "Camera Controls", "Node Physics", "Graph Data", "Particle Effects", "Glassmorphism"],
	"proj-cli-tool": ["Argument Parsing", "Templates", "Scaffolding", "Build Pipeline", "Environment Variables", "Git Automation", "Config Files"],
	"proj-ai-chat": ["Streaming API", "Token Rendering", "Chat History", "Markdown Render", "Syntax Highlighting", "Local Storage", "Dark Theme", "Animations"],
	"proj-task-app": ["Drag & Drop", "Date Parsing", "Offline First", "SQLite", "Widget Support", "Minimal UI", "Sync"],
	"proj-api-gateway": ["Request Routing", "Rate Limiting", "JWT Validation", "Edge Computing", "Load Balancing", "Analytics", "Cloudflare Workers"],
	"blog-why-3d": ["Creativity", "Portfolio Design", "Memorable UX", "Connections", "Interactive", "3D Web"],
	"blog-typescript-tricks": ["Type Safety", "Patterns", "Best Practices", "DX", "Discriminated Unions", "Const Assertions"],
	"blog-rust-journey": ["Borrow Checker", "Cargo", "Community", "CLI Building", "Web Scraping", "HTTP Server"],
	"blog-vite-deep": ["ESM", "HMR", "Rollup", "Tree Shaking", "Code Splitting", "Dev Server"],
	"blog-dark-ui": ["Color Theory", "Elevation", "Contrast", "Glassmorphism", "Accent Colors", "Typography"],
	about: ["Full Stack", "Open Source", "UI/UX", "DX Focus", "Learning", "Building", "Writing"],
	uses: ["VS Code", "Vim Keybindings", "Terminal", "Dual Monitor", "Mechanical Keyboard", "Oh My Posh"],
}

async function seed() {
	console.log("Seeding database...")

	// Build all nodes
	const allNodeRows: Array<{
		id: string
		title: string
		type: "hub" | "project" | "skill" | "blog" | "note" | "resource" | "hobby" | "dataset"
		cluster: "core" | "career" | "library" | "playground" | "life"
		visibility: "professional" | "explorer" | "god_mode"
		val: number
		content: string | null
		meta: Record<string, unknown> | null
	}> = []

	const allLinkRows: Array<{ source: string; target: string }> = []
	const nodeIds = new Set<string>()

	// Insert base nodes
	for (const n of baseNodes) {
		const type = mapType(n.type)
		const cluster = CATEGORY_TO_CLUSTER[n.category] || "core"
		const visibility = mapVisibility(n.type, false)

		allNodeRows.push({
			id: n.id,
			title: n.title,
			type,
			cluster,
			visibility,
			val: n.val || 1,
			content: n.content || null,
			meta: {
				...(n.description && { description: n.description }),
				...(n.date && { date: n.date }),
				...(n.tags && { tags: n.tags }),
				...(n.link && { link: n.link }),
				...(n.category && { category: n.category }),
			},
		})
		nodeIds.add(n.id)
	}

	// Generate keyword nodes
	for (const [parentId, keywords] of Object.entries(keywordMap)) {
		const parent = baseNodes.find((n) => n.id === parentId)
		if (!parent) continue

		for (const kw of keywords) {
			const kwId = `${parentId}--${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
			if (nodeIds.has(kwId)) continue
			nodeIds.add(kwId)

			const type = mapType(parent.type)
			const cluster = CATEGORY_TO_CLUSTER[parent.category] || "core"

			allNodeRows.push({
				id: kwId,
				title: kw,
				type,
				cluster,
				visibility: "god_mode",
				val: 1,
				content: null,
				meta: {
					description: `${kw} — related to ${parent.title}`,
					category: parent.category,
				},
			})
			allLinkRows.push({ source: parentId, target: kwId })
		}

		// Cross-link siblings
		const kwIds = keywords.map(
			(kw) => `${parentId}--${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		)
		for (let i = 0; i < Math.min(3, kwIds.length - 1); i++) {
			allLinkRows.push({ source: kwIds[i], target: kwIds[i + 1] })
		}
	}

	// Add base links
	for (const l of baseLinks) {
		allLinkRows.push(l)
	}

	// Insert nodes in batches
	console.log(`Inserting ${allNodeRows.length} nodes...`)
	const BATCH_SIZE = 50
	for (let i = 0; i < allNodeRows.length; i += BATCH_SIZE) {
		const batch = allNodeRows.slice(i, i + BATCH_SIZE)
		await db.insert(nodes).values(batch).onConflictDoNothing()
		console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} nodes`)
	}

	// Filter links — only keep those where both source and target exist
	const validLinks = allLinkRows.filter(
		(l) => nodeIds.has(l.source) && nodeIds.has(l.target),
	)

	// Deduplicate links
	const linkSet = new Set<string>()
	const uniqueLinks = validLinks.filter((l) => {
		const key = `${l.source}→${l.target}`
		if (linkSet.has(key)) return false
		linkSet.add(key)
		return true
	})

	console.log(`Inserting ${uniqueLinks.length} links...`)
	for (let i = 0; i < uniqueLinks.length; i += BATCH_SIZE) {
		const batch = uniqueLinks.slice(i, i + BATCH_SIZE)
		await db.insert(links).values(batch).onConflictDoNothing()
		console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} links`)
	}

	console.log("\nSeed complete!")
	console.log(`  Nodes: ${allNodeRows.length}`)
	console.log(`  Links: ${uniqueLinks.length}`)
}

seed().catch(console.error)
