import type { Node } from "@/db/schema"
import { slugify } from "@/lib/slug"

export interface InputFile {
	name: string
	content: string
}

export type ParsedNode = Pick<
	Node,
	"id" | "title" | "type" | "cluster" | "visibility" | "val"
> & {
	content: string | null
	meta: Node["meta"]
}

export interface ParsedGraph {
	nodes: ParsedNode[]
	links: Array<{ source: string; target: string }>
}

// Basit frontmatter (--- ... ---) ayrıştırması: title + tags.
function parseFrontmatter(raw: string): {
	body: string
	title?: string
	tags?: string[]
} {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
	if (!m) return { body: raw }

	const body = raw.slice(m[0].length)
	const result: { body: string; title?: string; tags?: string[] } = { body }

	for (const line of m[1].split(/\r?\n/)) {
		const kv = line.match(/^(\w+):\s*(.*)$/)
		if (!kv) continue
		const [, key, value] = kv
		if (key === "title" && value) {
			result.title = value.replace(/^["']|["']$/g, "")
		} else if (key === "tags" && value) {
			result.tags = value
				.replace(/[[\]]/g, "")
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
		}
	}
	return result
}

function fileBaseName(name: string): string {
	return name.replace(/\.[^.]+$/, "").replace(/^.*[/\\]/, "")
}

/**
 * Markdown/Obsidian dosyalarını node + link grafiğine çevirir.
 * - Her dosya → bir node (id = dosya adının slug'ı)
 * - [[wiki-link]] → kaynak node'dan hedefe bağlantı ([[hedef|alias]] ve
 *   [[hedef#başlık]] desteklenir)
 * - Frontmatter title/tags okunur; yoksa başlık ilk H1 ya da dosya adı
 * Geçersiz hedefe giden link'ler burada tutulur; var olmayan node'a giden
 * link'leri eleme işi import action'ında (FK güvenliği) yapılır.
 */
export function parseMarkdownFiles(files: InputFile[]): ParsedGraph {
	const nodeMap = new Map<string, ParsedNode>()
	const links: Array<{ source: string; target: string }> = []
	const linkSeen = new Set<string>()

	for (const file of files) {
		const base = fileBaseName(file.name)
		const id = slugify(base)
		const { body, title, tags } = parseFrontmatter(file.content)

		const h1 = body.match(/^#\s+(.+)$/m)
		const finalTitle = title || h1?.[1]?.trim() || base

		if (!nodeMap.has(id)) {
			nodeMap.set(id, {
				id,
				title: finalTitle,
				type: "note",
				cluster: "library",
				visibility: "professional",
				val: 1,
				content: body.trim() || null,
				meta: tags && tags.length ? { tags } : null,
			})
		}

		for (const m of body.matchAll(/\[\[([^\]]+)\]\]/g)) {
			const target = slugify(m[1].split("|")[0].split("#")[0].trim())
			if (!target || target === id) continue
			const key = `${id}->${target}`
			if (linkSeen.has(key)) continue
			linkSeen.add(key)
			links.push({ source: id, target })
		}
	}

	return { nodes: [...nodeMap.values()], links }
}
