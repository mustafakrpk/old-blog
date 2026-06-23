// Türkçe karakterleri ASCII'ye çevirerek temiz, okunabilir slug üretir.
const TR_MAP: Record<string, string> = {
	ç: "c",
	ğ: "g",
	ı: "i",
	İ: "i",
	ö: "o",
	ş: "s",
	ü: "u",
}

export function slugify(input: string): string {
	const lowered = input
		.toLowerCase()
		.replace(/[çğıİöşü]/g, (ch) => TR_MAP[ch] ?? ch)
	return (
		lowered
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 64) || "node"
	)
}
