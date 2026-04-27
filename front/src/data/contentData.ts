export type ContentType = "blog" | "project" | "skill" | "about" | "hub"

export interface ContentNode {
	id: string
	title: string
	type: ContentType
	category: string
	description: string
	content?: string // markdown
	date?: string
	tags?: string[]
	image?: string
	link?: string
	val?: number
}

export interface ContentLink {
	source: string
	target: string
}

export const TYPE_COLORS: Record<ContentType, string> = {
	hub: "#ffffff",
	about: "#a78bfa",
	blog: "#3b82f6",
	project: "#10b981",
	skill: "#f59e0b",
}

export const CATEGORY_COLORS: Record<string, string> = {
	Core: "#a78bfa",
	"Web Development": "#3b82f6",
	"Mobile & Apps": "#06b6d4",
	"AI & Data": "#10b981",
	Backend: "#f59e0b",
	DevOps: "#f43f5e",
	Design: "#ec4899",
	Writing: "#6366f1",
	Life: "#84cc16",
}

// ── Nodes ─────────────────────────────────────────────────────────

const nodes: ContentNode[] = [
	// ── Hub (center) ──
	{
		id: "me",
		title: "Mustafa Kirpik",
		type: "hub",
		category: "Core",
		description: "Developer, writer, builder.",
		val: 10,
		content: `# Hey, I'm Mustafa

I build things for the web. I write about what I learn. This is my corner of the internet — a living, breathing knowledge graph of everything I'm working on and thinking about.

**Navigate** by clicking nodes or searching above. Each node is a blog post, project, or skill.

Welcome to my universe.`,
	},

	// ── About ──
	{
		id: "about",
		title: "About Me",
		type: "about",
		category: "Core",
		description: "Who I am, what I do.",
		val: 5,
		content: `# About Me

I'm a developer passionate about building beautiful, functional web experiences.

## What I Do
- Full-stack web development
- UI/UX design with a focus on dark, immersive interfaces
- Open source contributions

## Currently
- Exploring 3D web experiences and data visualization
- Writing about software architecture and developer experience
- Building tools that help people learn

## Contact
- GitHub: [github.com](#)
- Twitter: [twitter.com](#)
- Email: hello@example.com`,
	},
	{
		id: "uses",
		title: "My Setup & Tools",
		type: "about",
		category: "Core",
		description: "Hardware, software, and tools I use daily.",
		val: 3,
		content: `# My Setup

## Editor
- **VS Code** with Vim keybindings
- Theme: One Dark Pro
- Font: JetBrains Mono

## Terminal
- Windows Terminal + PowerShell
- Oh My Posh for prompt

## Hardware
- Custom PC build
- Dual monitor setup
- Mechanical keyboard

## Stack
- TypeScript everywhere
- React + Vite for frontend
- Node.js / Bun for backend
- Tailwind CSS for styling`,
	},

	// ── Projects ──
	{
		id: "proj-knowledge-graph",
		title: "Knowledge Graph",
		type: "project",
		category: "Web Development",
		description: "3D interactive knowledge graph — this very site.",
		date: "2025-01",
		tags: ["React", "Three.js", "TypeScript", "Vite"],
		link: "#",
		val: 6,
		content: `# Knowledge Graph

This is the project you're looking at right now. A 3D interactive knowledge graph that serves as my blog and portfolio.

## Tech Stack
- **React 18** with TypeScript
- **react-force-graph-3d** for 3D visualization
- **Three.js** under the hood
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling

## Features
- 3D force-directed graph with physics simulation
- Glassmorphism search overlay
- Click-to-focus camera animation
- Slide-in content panels
- Fully responsive

## Why?
Because static portfolio sites are boring. I wanted something that shows how ideas connect — a living map of my work.`,
	},
	{
		id: "proj-cli-tool",
		title: "DevFlow CLI",
		type: "project",
		category: "Backend",
		description: "A CLI tool for automating dev workflows.",
		date: "2024-11",
		tags: ["Rust", "CLI", "Automation"],
		link: "#",
		val: 4,
		content: `# DevFlow CLI

A command-line tool that automates repetitive development workflows.

## What it does
- Scaffolds new projects with templates
- Runs pre-configured build pipelines
- Manages environment variables across projects
- Git workflow automation (branch naming, commit messages)

## Built with
- **Rust** for performance
- **clap** for argument parsing
- **tokio** for async operations

## Installation
\`\`\`bash
cargo install devflow
\`\`\``,
	},
	{
		id: "proj-ai-chat",
		title: "AI Chat Interface",
		type: "project",
		category: "AI & Data",
		description: "A beautiful chat UI for LLM interactions.",
		date: "2025-01",
		tags: ["React", "OpenAI", "Streaming", "TypeScript"],
		val: 5,
		content: `# AI Chat Interface

A minimal, beautiful chat interface for interacting with large language models.

## Features
- Streaming token-by-token responses
- Markdown rendering in messages
- Code syntax highlighting
- Conversation history with local storage
- Dark mode by default

## Stack
- React + TypeScript
- OpenAI API with streaming
- Tailwind CSS
- Framer Motion for animations`,
	},
	{
		id: "proj-task-app",
		title: "Taskflow",
		type: "project",
		category: "Mobile & Apps",
		description: "A minimalist task management app.",
		date: "2024-08",
		tags: ["React Native", "TypeScript", "SQLite"],
		val: 4,
		content: `# Taskflow

A minimalist task management app that focuses on what matters.

## Philosophy
No bloat. No gamification. Just your tasks, organized simply.

## Features
- Drag and drop reordering
- Natural language date parsing
- Offline-first with SQLite
- Widget support

## Built with
- React Native
- TypeScript
- SQLite for local storage
- Expo for deployment`,
	},
	{
		id: "proj-api-gateway",
		title: "Edge API Gateway",
		type: "project",
		category: "Backend",
		description: "A lightweight API gateway running at the edge.",
		date: "2024-06",
		tags: ["Go", "Cloudflare Workers", "API"],
		val: 4,
		content: `# Edge API Gateway

A lightweight API gateway designed to run at the edge for minimal latency.

## Features
- Request routing and load balancing
- Rate limiting per API key
- JWT validation at the edge
- Request/response transformation
- Built-in analytics

## Tech
- **Go** core logic
- Deployable to **Cloudflare Workers**
- Sub-millisecond routing decisions`,
	},

	// ── Blog Posts ──
	{
		id: "blog-why-3d",
		title: "Why I Built a 3D Portfolio",
		type: "blog",
		category: "Writing",
		description: "The story behind this unconventional portfolio site.",
		date: "2025-01-15",
		tags: ["portfolio", "3D", "creativity"],
		val: 3,
		content: `# Why I Built a 3D Portfolio

Most portfolio sites are the same: a hero section, an about section, a grid of projects. Clean, professional, forgettable.

I wanted something different. Something that reflects how I actually think — not in neat rows, but in **connections**.

## The Idea

Every project I build connects to skills I've learned. Every blog post references tools I use. My knowledge isn't a list — it's a **graph**.

So I built my portfolio as a 3D knowledge graph. Each node is a piece of content. Each link shows a relationship. You can orbit around it, zoom in, click, explore.

## Is it Practical?

Honestly? It's harder to navigate than a normal site. But that's not the point. The point is that it's **memorable**. And in a sea of identical portfolios, being memorable matters.

## The Tech

- react-force-graph-3d for the 3D rendering
- Three.js under the hood
- d3-force-3d for the physics simulation
- Custom glassmorphism UI on top

It was a fun build. And it's mine.`,
	},
	{
		id: "blog-typescript-tricks",
		title: "TypeScript Tricks I Use Daily",
		type: "blog",
		category: "Web Development",
		description: "Practical TypeScript patterns for real-world code.",
		date: "2025-01-10",
		tags: ["TypeScript", "tips", "patterns"],
		val: 3,
		content: `# TypeScript Tricks I Use Daily

After years of TypeScript, these are the patterns I reach for most.

## 1. Discriminated Unions

\`\`\`typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
\`\`\`

## 2. \`satisfies\` Operator

\`\`\`typescript
const config = {
  port: 3000,
  host: "localhost",
} satisfies ServerConfig
\`\`\`

## 3. Template Literal Types

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`
\`\`\`

## 4. Const Assertions

\`\`\`typescript
const ROUTES = ["home", "about", "blog"] as const
type Route = (typeof ROUTES)[number]
\`\`\`

These patterns eliminate entire categories of bugs. Use them.`,
	},
	{
		id: "blog-rust-journey",
		title: "My Rust Journey: 6 Months In",
		type: "blog",
		category: "Writing",
		description: "What I've learned after 6 months of writing Rust.",
		date: "2024-12-20",
		tags: ["Rust", "learning", "systems"],
		val: 3,
		content: `# My Rust Journey: 6 Months In

Six months ago I wrote my first line of Rust. Here's what I've learned.

## The Borrow Checker is Your Friend

Yes, it's frustrating at first. But once you internalize ownership, your code becomes bulletproof. No null pointer exceptions. No data races. Ever.

## Cargo is Best-in-Class

Coming from npm/yarn, Cargo feels like a breath of fresh air. Build, test, lint, publish — all one tool, all fast.

## The Community is Great

The Rust community is incredibly helpful. The compiler error messages are actually useful. The documentation is thorough.

## What I Built

- A CLI tool (devflow)
- A web scraper
- A simple HTTP server
- Currently: a Markdown parser

## Would I Recommend It?

Absolutely. Even if you never use Rust professionally, learning it makes you a better programmer in every language.`,
	},
	{
		id: "blog-vite-deep",
		title: "Vite Deep Dive",
		type: "blog",
		category: "Web Development",
		description: "Understanding how Vite works under the hood.",
		date: "2024-11-15",
		tags: ["Vite", "bundler", "DX"],
		val: 3,
		content: `# Vite Deep Dive

Vite changed how I think about frontend tooling. Here's how it actually works.

## Dev Server: Native ESM

In development, Vite serves files as native ES modules. No bundling. The browser does the module resolution. This is why it starts instantly.

## HMR: Surgical Updates

When you edit a file, Vite only invalidates that exact module and its importers. No full-page reload. Changes appear in milliseconds.

## Production: Rollup

For production, Vite uses Rollup to create optimized bundles. Tree shaking, code splitting, minification — all handled.

## Why It Matters

Developer experience matters. A tool that's fast enough to disappear from your workflow lets you focus on building, not waiting.`,
	},
	{
		id: "blog-dark-ui",
		title: "Designing Dark UIs That Don't Suck",
		type: "blog",
		category: "Design",
		description: "Principles for effective dark mode design.",
		date: "2024-10-20",
		tags: ["design", "UI", "dark mode"],
		val: 3,
		content: `# Designing Dark UIs That Don't Suck

Dark mode isn't just inverting colors. Here's how to do it right.

## Don't Use Pure Black

\`#000000\` is too harsh. Use dark grays like \`#0a0a0f\` or \`#111118\`. Add a subtle blue or purple tint for depth.

## Reduce Contrast, Don't Eliminate It

White text on dark backgrounds should be \`rgba(255,255,255,0.85)\`, not pure \`#fff\`. Reserve pure white for emphasis.

## Use Elevation with Opacity

Instead of shadows (which disappear on dark backgrounds), use lighter surface colors for elevated elements. \`bg-white/5\` → \`bg-white/10\` → \`bg-white/15\`.

## Glassmorphism Works

Backdrop blur + semi-transparent backgrounds look stunning on dark themes. Use \`backdrop-blur-xl\` with \`bg-white/[0.05]\`.

## Color Should Pop

On dark backgrounds, accent colors appear more vibrant. Use this to your advantage. Let your brand colors shine.`,
	},

	// ── Skills ──
	{
		id: "skill-react",
		title: "React",
		type: "skill",
		category: "Web Development",
		description: "Component-based UI library.",
		tags: ["frontend", "library"],
		val: 3,
		content: `# React

My primary frontend framework. I've been using React since 2020.

## What I Use
- Hooks (useState, useEffect, useMemo, useCallback, useRef)
- Context API for light state management
- Server Components (exploring)
- React Router for navigation

## Libraries I Pair With
- Tailwind CSS
- Zustand / Valtio for state
- React Query for data fetching
- Framer Motion for animation`,
	},
	{
		id: "skill-typescript",
		title: "TypeScript",
		type: "skill",
		category: "Web Development",
		description: "Typed JavaScript at scale.",
		tags: ["language", "frontend", "backend"],
		val: 3,
		content: `# TypeScript

TypeScript is my default for all JavaScript projects.

## Proficiency
- Advanced type system (generics, mapped types, conditional types)
- Strict mode always on
- Declaration file authoring
- Compiler API basics`,
	},
	{
		id: "skill-rust",
		title: "Rust",
		type: "skill",
		category: "Backend",
		description: "Systems programming language.",
		tags: ["language", "systems"],
		val: 3,
	},
	{
		id: "skill-go",
		title: "Go",
		type: "skill",
		category: "Backend",
		description: "Fast, concurrent, simple.",
		tags: ["language", "backend"],
		val: 2,
	},
	{
		id: "skill-threejs",
		title: "Three.js",
		type: "skill",
		category: "Web Development",
		description: "3D graphics in the browser.",
		tags: ["3D", "graphics", "frontend"],
		val: 2,
	},
	{
		id: "skill-tailwind",
		title: "Tailwind CSS",
		type: "skill",
		category: "Design",
		description: "Utility-first CSS framework.",
		tags: ["CSS", "styling"],
		val: 2,
	},
	{
		id: "skill-docker",
		title: "Docker",
		type: "skill",
		category: "DevOps",
		description: "Containerization platform.",
		tags: ["devops", "containers"],
		val: 2,
	},
	{
		id: "skill-figma",
		title: "Figma",
		type: "skill",
		category: "Design",
		description: "UI design tool.",
		tags: ["design", "UI"],
		val: 2,
	},
	{
		id: "skill-node",
		title: "Node.js",
		type: "skill",
		category: "Backend",
		description: "JavaScript runtime for the server.",
		tags: ["runtime", "backend"],
		val: 2,
	},
	{
		id: "skill-python",
		title: "Python",
		type: "skill",
		category: "AI & Data",
		description: "Data science and scripting.",
		tags: ["language", "data"],
		val: 2,
	},
	{
		id: "skill-git",
		title: "Git",
		type: "skill",
		category: "DevOps",
		description: "Version control.",
		tags: ["devops", "workflow"],
		val: 2,
	},
]

// ── Links ──────────────────────────────────────────────────────────

const links: ContentLink[] = [
	// Hub connects to main categories
	{ source: "me", target: "about" },
	{ source: "me", target: "uses" },

	// Projects from hub
	{ source: "me", target: "proj-knowledge-graph" },
	{ source: "me", target: "proj-cli-tool" },
	{ source: "me", target: "proj-ai-chat" },
	{ source: "me", target: "proj-task-app" },
	{ source: "me", target: "proj-api-gateway" },

	// Blog posts from hub
	{ source: "me", target: "blog-why-3d" },
	{ source: "me", target: "blog-typescript-tricks" },
	{ source: "me", target: "blog-rust-journey" },
	{ source: "me", target: "blog-vite-deep" },
	{ source: "me", target: "blog-dark-ui" },

	// Project → skill connections
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

	// Blog → skill/project connections
	{ source: "blog-why-3d", target: "proj-knowledge-graph" },
	{ source: "blog-why-3d", target: "skill-threejs" },
	{ source: "blog-typescript-tricks", target: "skill-typescript" },
	{ source: "blog-rust-journey", target: "skill-rust" },
	{ source: "blog-rust-journey", target: "proj-cli-tool" },
	{ source: "blog-vite-deep", target: "skill-react" },
	{ source: "blog-dark-ui", target: "skill-tailwind" },
	{ source: "blog-dark-ui", target: "skill-figma" },

	// Skill → skill connections
	{ source: "skill-react", target: "skill-typescript" },
	{ source: "skill-react", target: "skill-tailwind" },
	{ source: "skill-react", target: "skill-node" },
	{ source: "skill-typescript", target: "skill-node" },
	{ source: "skill-rust", target: "skill-go" },
	{ source: "skill-docker", target: "skill-git" },
	{ source: "skill-python", target: "skill-node" },

	// About ↔ skills
	{ source: "about", target: "skill-react" },
	{ source: "about", target: "skill-rust" },
	{ source: "uses", target: "skill-typescript" },
	{ source: "uses", target: "skill-git" },
	{ source: "uses", target: "skill-docker" },
]

// ── Keyword expansion per node → generates 200+ extra nodes ────────

const keywordMap: Record<string, string[]> = {
	"skill-react": [
		"Hooks", "JSX", "Virtual DOM", "Context API", "Suspense",
		"Server Components", "React Router", "Redux", "Zustand", "React Query",
		"Error Boundaries", "Portals", "Refs", "Memoization", "Fiber",
		"Concurrent Mode", "Hydration", "Code Splitting", "Lazy Loading",
	],
	"skill-typescript": [
		"Generics", "Utility Types", "Type Guards", "Mapped Types", "Enums",
		"Decorators", "Declaration Files", "Strict Mode", "Conditional Types",
		"Template Literals", "Discriminated Unions", "Type Inference", "Compiler API",
		"satisfies", "Branded Types", "Infer Keyword",
	],
	"skill-rust": [
		"Ownership", "Borrowing", "Lifetimes", "Traits", "Pattern Matching",
		"Cargo", "Tokio", "Serde", "Macros", "Error Handling",
		"Unsafe Rust", "FFI", "WebAssembly", "Actix Web", "Embedded",
	],
	"skill-go": [
		"Goroutines", "Channels", "Interfaces", "Go Modules", "Error Handling",
		"Gin", "Context Package", "Testing", "Concurrency", "Reflection",
		"Generics", "Build Tags", "Profiling",
	],
	"skill-threejs": [
		"Scene", "Camera", "Renderer", "Mesh", "Geometry",
		"Materials", "Lighting", "Shadows", "Raycasting", "Post Processing",
		"Shaders", "GLSL", "OrbitControls", "Textures", "Animation Loop",
	],
	"skill-tailwind": [
		"Utility Classes", "Responsive Design", "Dark Mode", "Plugins",
		"Arbitrary Values", "JIT Compiler", "Customization", "Preflight",
		"Container Queries", "Animations", "Transitions",
	],
	"skill-docker": [
		"Dockerfile", "Compose", "Volumes", "Networks", "Images",
		"Containers", "Registry", "Multi-stage Builds", "Health Checks",
		"Swarm", "Overlay Network", "Secrets",
	],
	"skill-node": [
		"Express.js", "Fastify", "Event Loop", "Streams", "Cluster",
		"Worker Threads", "NPM", "Middleware", "File System", "Buffers",
		"Child Processes", "REPL", "ESM Modules",
	],
	"skill-python": [
		"NumPy", "Pandas", "FastAPI", "Django", "Flask",
		"Asyncio", "Decorators", "Type Hints", "Poetry", "Pydantic",
		"SQLAlchemy", "Celery", "Jupyter", "pytest",
	],
	"skill-figma": [
		"Components", "Auto Layout", "Variants", "Prototyping",
		"Design Tokens", "Plugins", "Grids", "Typography", "Color Styles",
	],
	"skill-git": [
		"Branching", "Merging", "Rebasing", "Cherry Pick", "Stash",
		"Hooks", "Submodules", "Bisect", "Reflog", "Worktrees",
	],
	"proj-knowledge-graph": [
		"Force Layout", "d3-force", "3D Rendering", "WebGL", "Camera Controls",
		"Node Physics", "Graph Data", "Particle Effects", "Glassmorphism",
	],
	"proj-cli-tool": [
		"Argument Parsing", "Templates", "Scaffolding", "Build Pipeline",
		"Environment Variables", "Git Automation", "Config Files",
	],
	"proj-ai-chat": [
		"Streaming API", "Token Rendering", "Chat History", "Markdown Render",
		"Syntax Highlighting", "Local Storage", "Dark Theme", "Animations",
	],
	"proj-task-app": [
		"Drag & Drop", "Date Parsing", "Offline First", "SQLite",
		"Widget Support", "Minimal UI", "Sync",
	],
	"proj-api-gateway": [
		"Request Routing", "Rate Limiting", "JWT Validation", "Edge Computing",
		"Load Balancing", "Analytics", "Cloudflare Workers",
	],
	"blog-why-3d": [
		"Creativity", "Portfolio Design", "Memorable UX", "Connections",
		"Interactive", "3D Web",
	],
	"blog-typescript-tricks": [
		"Type Safety", "Patterns", "Best Practices", "DX",
		"Discriminated Unions", "Const Assertions",
	],
	"blog-rust-journey": [
		"Borrow Checker", "Cargo", "Community", "CLI Building",
		"Web Scraping", "HTTP Server",
	],
	"blog-vite-deep": [
		"ESM", "HMR", "Rollup", "Tree Shaking",
		"Code Splitting", "Dev Server",
	],
	"blog-dark-ui": [
		"Color Theory", "Elevation", "Contrast", "Glassmorphism",
		"Accent Colors", "Typography",
	],
	about: [
		"Full Stack", "Open Source", "UI/UX", "DX Focus",
		"Learning", "Building", "Writing",
	],
	uses: [
		"VS Code", "Vim Keybindings", "Terminal", "Dual Monitor",
		"Mechanical Keyboard", "Oh My Posh",
	],
}

function buildGraph(): { nodes: ContentNode[]; links: ContentLink[] } {
	const allNodes: ContentNode[] = [...nodes]
	const allLinks: ContentLink[] = [...links]
	const existingIds = new Set(nodes.map((n) => n.id))

	for (const [parentId, keywords] of Object.entries(keywordMap)) {
		const parent = nodes.find((n) => n.id === parentId)
		if (!parent) continue

		for (const kw of keywords) {
			const kwId = `${parentId}--${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
			if (existingIds.has(kwId)) continue
			existingIds.add(kwId)

			allNodes.push({
				id: kwId,
				title: kw,
				type: parent.type,
				category: parent.category,
				description: `${kw} — related to ${parent.title}`,
				val: 1,
			})
			allLinks.push({ source: parentId, target: kwId })
		}

		// Cross-link some siblings
		const kwIds = keywords.map(
			(kw) => `${parentId}--${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
		)
		for (let i = 0; i < Math.min(3, kwIds.length - 1); i++) {
			allLinks.push({ source: kwIds[i], target: kwIds[i + 1] })
		}
	}

	return { nodes: allNodes, links: allLinks }
}

const graph = buildGraph()
export const contentNodes: ContentNode[] = graph.nodes
export const contentLinks: ContentLink[] = graph.links
