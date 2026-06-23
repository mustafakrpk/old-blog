import type { Node } from "@/db/schema"

// Şablon node'u: insert için gereken alanlar (workspaceId server'da eklenir).
export type TemplateNode = Pick<
	Node,
	"id" | "title" | "type" | "cluster" | "visibility" | "val"
> & {
	content?: string | null
	meta?: Node["meta"]
}

export interface Template {
	key: string
	name: string
	emoji: string
	description: string
	nodes: TemplateNode[]
	links: Array<{ source: string; target: string }>
}

const n = (
	id: string,
	title: string,
	type: Node["type"],
	cluster: Node["cluster"],
	val = 1,
	description?: string,
): TemplateNode => ({
	id,
	title,
	type,
	cluster,
	visibility: "professional",
	val,
	content: null,
	meta: description ? { description } : null,
})

export const TEMPLATES: Template[] = [
	{
		key: "portfolio",
		name: "Portfolyo",
		emoji: "🎯",
		description: "Kendini, projelerini ve yeteneklerini tanıtan bir vitrin.",
		nodes: [
			n("hakkimda", "Hakkımda", "hub", "core", 6, "Kim olduğunu anlat."),
			n("proje-1", "Öne Çıkan Proje", "project", "career", 3),
			n("proje-2", "İkinci Proje", "project", "career", 2),
			n("yetenek-1", "Ana Yeteneğin", "skill", "career", 2),
			n("yetenek-2", "İkinci Yeteneğin", "skill", "career", 2),
			n("iletisim", "İletişim", "note", "core", 2, "E-posta, sosyal medya."),
		],
		links: [
			{ source: "hakkimda", target: "proje-1" },
			{ source: "hakkimda", target: "proje-2" },
			{ source: "hakkimda", target: "yetenek-1" },
			{ source: "hakkimda", target: "yetenek-2" },
			{ source: "hakkimda", target: "iletisim" },
			{ source: "proje-1", target: "yetenek-1" },
		],
	},
	{
		key: "second-brain",
		name: "İkinci Beyin",
		emoji: "🧠",
		description: "Notlarını, fikirlerini ve kaynaklarını bağlantılı tut.",
		nodes: [
			n("merkez", "İkinci Beynim", "hub", "core", 6),
			n("fikirler", "Fikirler", "note", "library", 3),
			n("kitaplar", "Kitaplar", "resource", "library", 3),
			n("alintilar", "Alıntılar", "note", "library", 2),
			n("projeler", "Aktif Projeler", "project", "playground", 3),
			n("gunluk", "Günlük Notlar", "note", "life", 2),
		],
		links: [
			{ source: "merkez", target: "fikirler" },
			{ source: "merkez", target: "kitaplar" },
			{ source: "merkez", target: "projeler" },
			{ source: "merkez", target: "gunluk" },
			{ source: "fikirler", target: "alintilar" },
			{ source: "kitaplar", target: "alintilar" },
		],
	},
	{
		key: "researcher",
		name: "Araştırmacı",
		emoji: "🔬",
		description: "Bir konuyu, kaynaklarını ve bulgularını haritalandır.",
		nodes: [
			n("konu", "Araştırma Konusu", "hub", "core", 6),
			n("soru-1", "Temel Soru", "note", "core", 3),
			n("kaynak-1", "Birincil Kaynak", "resource", "library", 2),
			n("kaynak-2", "İkincil Kaynak", "resource", "library", 2),
			n("bulgu-1", "Bulgu", "note", "library", 2),
			n("sonraki", "Sonraki Adımlar", "note", "playground", 2),
		],
		links: [
			{ source: "konu", target: "soru-1" },
			{ source: "konu", target: "kaynak-1" },
			{ source: "konu", target: "kaynak-2" },
			{ source: "soru-1", target: "bulgu-1" },
			{ source: "kaynak-1", target: "bulgu-1" },
			{ source: "bulgu-1", target: "sonraki" },
		],
	},
	{
		key: "student",
		name: "Öğrenci",
		emoji: "📚",
		description: "Derslerini, konularını ve kaynaklarını organize et.",
		nodes: [
			n("okul", "Derslerim", "hub", "core", 6),
			n("ders-1", "Ders 1", "skill", "library", 3),
			n("ders-2", "Ders 2", "skill", "library", 3),
			n("konu-1", "Önemli Konu", "note", "library", 2),
			n("odev", "Ödevler", "project", "playground", 2),
			n("kaynak", "Çalışma Kaynakları", "resource", "library", 2),
		],
		links: [
			{ source: "okul", target: "ders-1" },
			{ source: "okul", target: "ders-2" },
			{ source: "ders-1", target: "konu-1" },
			{ source: "ders-1", target: "odev" },
			{ source: "ders-2", target: "kaynak" },
			{ source: "konu-1", target: "kaynak" },
		],
	},
]

export function getTemplate(key: string): Template | undefined {
	return TEMPLATES.find((t) => t.key === key)
}
