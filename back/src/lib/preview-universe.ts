// Yoğunluk önizlemesi: kolektif evren binlerce galaksiyle nasıl görünecek?
//
// Bu veri YALNIZCA ?preview=<n> ile istendiğinde üretilir ve DB'ye hiç
// dokunmaz. Amaç, tasarımı gerçek kullanıcı verisi birikmeden önce
// yoğunlukta test etmek. Kalıcı hiçbir yan etkisi yok.
//
// İsimler kasıtlı olarak insan ismi DEĞİL — ürün worldbuilding platformu,
// yıldızlar da "dünyalar" gibi adlandırılıyor.

import type { GraphData, GraphNode } from "@/lib/types"

/** Önizleme node'ları bu önekle işaretlenir; tıklanınca gezinme yapılmaz. */
export const PREVIEW_PREFIX = "preview-"

export const PREVIEW_MAX = 1200

const ADJECTIVES = [
	"Ashen", "Hollow", "Gilded", "Sunken", "Verdant", "Obsidian", "Crimson",
	"Frostbound", "Emberlit", "Whispering", "Shattered", "Eternal", "Drowned",
	"Silvered", "Starlit", "Ruined", "Wandering", "Pale", "Thorned", "Molten",
	"Veiled", "Glass", "Hollowed", "Amber", "Cinder", "Tidal", "Umbral",
]

const NOUNS = [
	"Vault", "Archive", "Spire", "Atlas", "Codex", "Reliquary", "Compendium",
	"Observatory", "Foundry", "Bestiary", "Chronicle", "Lexicon", "Almanac",
	"Gazetteer", "Herbarium", "Scriptorium", "Repository", "Orrery", "Cartulary",
	"Menagerie", "Conservatory", "Ledger", "Index", "Cairn",
]

const REALMS = [
	"Vaelthorn", "Aurelith", "Kesmara", "Ondralis", "Sarkhet", "Duskmere",
	"Ilthavan", "Cindralis", "Voranth", "Yllumar", "Tessalon", "Ambergrave",
	"Nyxholm", "Rhovanel", "Kaldris", "Otheria", "Brackwater", "Suneater",
]

/** Evrende renk `cluster` üzerinden dağılıyor — topluluklar buradan doğuyor. */
const CONCEPTS = [
	"mythology", "cartography", "linguistics", "bestiary", "cosmology",
	"heraldry", "alchemy", "seafaring", "architecture", "folklore",
	"astronomy", "metallurgy",
]

/** Deterministik PRNG — aynı sayı istendiğinde aynı evren çıksın. */
function makeRandom(seed: number) {
	let h = seed >>> 0
	return () => {
		h ^= h << 13
		h >>>= 0
		h ^= h >>> 17
		h ^= h << 5
		h >>>= 0
		return h / 4294967296
	}
}

function nameFor(rand: () => number): string {
	const adj = ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]
	const noun = NOUNS[Math.floor(rand() * NOUNS.length)]
	const realm = REALMS[Math.floor(rand() * REALMS.length)]
	const form = rand()
	if (form < 0.4) return `The ${adj} ${noun}`
	if (form < 0.75) return `${noun} of ${realm}`
	return `${realm} ${noun}`
}

/**
 * n adet sahte galaksi + aralarında gerçekçi bağlar üretir.
 * Boyut dağılımı kasıtlı olarak güç yasasına yakın: çoğu küçük, birkaçı dev —
 * gerçek bir platformda olacağı gibi.
 */
export function buildPreviewUniverse(n: number): GraphData {
	const count = Math.max(0, Math.min(PREVIEW_MAX, Math.floor(n)))
	if (count === 0) return { nodes: [], links: [] }

	const rand = makeRandom(count * 2654435761)
	const nodes: GraphNode[] = []
	const communityOf: string[] = []

	for (let i = 0; i < count; i++) {
		const id = `${PREVIEW_PREFIX}${i}`
		const concept = CONCEPTS[Math.floor(rand() * CONCEPTS.length)]
		communityOf.push(concept)

		// val = "node sayısı" → yıldız boyutu. rand^2.4 uzun kuyruk verir.
		const val = 1 + Math.floor(Math.pow(rand(), 2.4) * 140)

		nodes.push({
			id,
			title: nameFor(rand),
			type: "hub",
			cluster: id, // renk kişi başına — gerçek evrendeki davranışın aynısı
			visibility: "professional",
			val,
			content: null,
			meta: { category: concept },
		})
	}

	// Bağlar: aynı kavram topluluğu içinde yoğun, topluluklar arası seyrek.
	const links: GraphData["links"] = []
	const seen = new Set<string>()
	const linkCap = count * 3

	const byCommunity = new Map<string, string[]>()
	nodes.forEach((node, i) => {
		const c = communityOf[i]
		if (!byCommunity.has(c)) byCommunity.set(c, [])
		byCommunity.get(c)!.push(node.id)
	})

	const push = (a: string, b: string) => {
		if (a === b || links.length >= linkCap) return
		const key = a < b ? `${a}|${b}` : `${b}|${a}`
		if (seen.has(key)) return
		seen.add(key)
		links.push({ source: a, target: b })
	}

	for (const members of byCommunity.values()) {
		for (let i = 1; i < members.length; i++) {
			// Tercihli bağlanma: yeni gelen, topluluktaki mevcutlardan birine bağlanır.
			const target = members[Math.floor(rand() * i)]
			push(members[i], target)
			// Bir miktar ekstra iç bağ — kümeler tel gibi değil, ağ gibi görünsün.
			if (rand() < 0.35) push(members[i], members[Math.floor(rand() * i)])
		}
	}

	// Topluluklar arası köprüler — evren tek parça kalsın.
	const bridgeCount = Math.max(4, Math.floor(count * 0.04))
	for (let i = 0; i < bridgeCount; i++) {
		push(
			nodes[Math.floor(rand() * count)].id,
			nodes[Math.floor(rand() * count)].id,
		)
	}

	return { nodes, links }
}

/** ?preview=<n> değerini güvenli bir sayıya çevirir. Geçersizse 0. */
export function parsePreviewParam(raw: string | undefined): number {
	if (!raw) return 0
	const n = Number.parseInt(raw, 10)
	if (!Number.isFinite(n) || n <= 0) return 0
	return Math.min(PREVIEW_MAX, n)
}
