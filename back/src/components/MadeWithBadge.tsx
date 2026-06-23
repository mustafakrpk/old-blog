import { BRAND } from "@/lib/brand"

// Public viewer köşesinde "Made with" rozeti. Free plan'da görünür,
// Pro'da gizlenir (viral döngü: her paylaşılan galaksi bir davet).
export default function MadeWithBadge() {
	return (
		<a
			href="/admin/login"
			className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/[0.12] px-3.5 py-2 text-xs text-white/70 hover:text-white/95 hover:bg-white/[0.12] transition-colors"
		>
			<span className="text-purple-300">✦</span>
			Made with <span className="font-semibold">{BRAND}</span>
		</a>
	)
}
