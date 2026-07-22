import Link from "next/link"
import { BRAND } from "@/lib/brand"

// Public viewer köşesinde "Made with" rozeti. Free plan'da görünür,
// Pro'da gizlenir (viral döngü: her paylaşılan galaksi bir davet).
export default function MadeWithBadge() {
	return (
		// Mobilde mod seçici alta ortalandığı için rozet yukarı kayar.
		<Link
			href="/"
			className="focus-ring glass fixed bottom-24 sm:bottom-5 right-4 sm:right-5 z-50 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] transition-all duration-300 hover:-translate-y-0.5"
		>
			<span style={{ color: "var(--accent)" }}>✦</span>
			Made with <span className="font-semibold">{BRAND}</span>
		</Link>
	)
}
