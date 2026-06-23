// Graph temaları. Arka plan rengi public viewer'da uygulanır.
// galaxy = free varsayılan; diğerleri Pro.

export interface Theme {
	key: string
	name: string
	bg: string // canvas + sayfa arka planı (koyu — node'lar parlasın)
	accent: string
	free: boolean
}

export const THEMES: Theme[] = [
	{ key: "galaxy", name: "Galaxy", bg: "#000011", accent: "#a78bfa", free: true },
	{ key: "obsidian", name: "Obsidian", bg: "#0c0c0f", accent: "#9ca3af", free: false },
	{ key: "deep-sea", name: "Deep Sea", bg: "#021018", accent: "#22d3ee", free: false },
	{ key: "plum", name: "Plum", bg: "#16081c", accent: "#e879f9", free: false },
	{ key: "forest", name: "Forest", bg: "#05130c", accent: "#34d399", free: false },
]

export const DEFAULT_THEME = THEMES[0]

export function getTheme(key: string | null | undefined): Theme {
	return THEMES.find((t) => t.key === key) ?? DEFAULT_THEME
}
