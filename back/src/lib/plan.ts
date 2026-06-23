// Plan tanımları ve özellik kapıları. Tek kaynak — UI ve server burayı kullanır.

export type Plan = "free" | "pro" | "team"

export const PRO_PRICE_LABEL = "$9/ay"

// Free plan node limiti (Pro = sınırsız).
export const FREE_NODE_LIMIT = 100

export function isPaid(plan: string): boolean {
	return plan === "pro" || plan === "team"
}

export function nodeLimit(plan: string): number {
	return isPaid(plan) ? Infinity : FREE_NODE_LIMIT
}

// Pro avantajları (UI'da listelemek için).
export const PRO_PERKS = [
	"Sınırsız node",
	'"Made with" rozeti kalkar',
	"Özel domain (yakında)",
	"Premium temalar (yakında)",
	"Ziyaretçi analytics (yakında)",
]
