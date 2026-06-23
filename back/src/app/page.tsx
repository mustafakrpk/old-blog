import Link from "next/link"
import type { Metadata } from "next"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"
import { PRO_PRICE_LABEL, PRO_PERKS, FREE_NODE_LIMIT } from "@/lib/plan"

export const metadata: Metadata = {
	title: `${BRAND} — bilgini gezilebilir bir evrene çevir`,
	description: BRAND_TAGLINE,
}

const FEATURES = [
	{
		icon: "🌌",
		title: "Gezilebilir galaksi",
		body: "Notların, projelerin ve fikirlerin birbirine bağlı, interaktif bir evren olarak yaşar.",
	},
	{
		icon: "📥",
		title: "Obsidian / Markdown import",
		body: "Vault'unu yükle — [[wiki-link]]'ler otomatik bağlantıya dönüşür.",
	},
	{
		icon: "🔗",
		title: "Tek linkle paylaş",
		body: "Kendi public adresin: /u/senin-adın. Herkes galaksini gezebilir.",
	},
	{
		icon: "✨",
		title: "Saniyeler içinde başla",
		body: "Hazır şablonlarla boş ekrandan dolu bir grafiğe 60 saniyede geç.",
	},
]

const STEPS = [
	{ n: "1", t: "Kaydol", d: "Ücretsiz hesabını aç, kendi workspace'ini al." },
	{ n: "2", t: "Doldur", d: "Şablonla başla ya da Markdown notlarını içe aktar." },
	{ n: "3", t: "Paylaş", d: "Public linkini paylaş, galaksin keşfedilsin." },
]

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[#000011] text-white overflow-x-hidden">
			{/* Nav */}
			<nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
				<span className="font-semibold tracking-tight">
					<span className="text-purple-400">✦</span> {BRAND}
				</span>
				<div className="flex items-center gap-3 text-sm">
					<Link
						href="/explore"
						className="text-white/60 hover:text-white/90 transition-colors"
					>
						Keşfet
					</Link>
					<Link
						href="/admin/login"
						className="text-white/60 hover:text-white/90 transition-colors"
					>
						Giriş
					</Link>
					<Link
						href="/admin/login"
						className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.16] transition-colors"
					>
						Ücretsiz başla
					</Link>
				</div>
			</nav>

			{/* Hero */}
			<header className="relative">
				<div
					className="absolute inset-0 -z-10"
					style={{
						background:
							"radial-gradient(circle at 50% 30%, rgba(120,80,220,0.25) 0%, transparent 60%)",
					}}
				/>
				<div className="max-w-3xl mx-auto text-center px-6 pt-24 pb-20">
					<h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
						Bilgini gezilebilir bir{" "}
						<span className="text-purple-400">evrene</span> çevir
					</h1>
					<p className="text-white/50 text-lg mt-6 max-w-xl mx-auto">
						{BRAND_TAGLINE} Notların, projelerin ve fikirlerin —
						bağlantılı, görsel, paylaşılabilir bir bilgi galaksisi.
					</p>
					<div className="flex items-center justify-center gap-3 mt-9">
						<Link
							href="/admin/login"
							className="px-6 py-3 rounded-full bg-purple-500/30 hover:bg-purple-500/45 border border-purple-400/30 text-white font-semibold transition-colors"
						>
							Kendi galaksini yap →
						</Link>
						<Link
							href="/u/mustafa"
							className="px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/80 transition-colors"
						>
							Canlı örneği gör
						</Link>
					</div>
				</div>
			</header>

			{/* Features */}
			<section className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-4">
				{FEATURES.map((f) => (
					<div
						key={f.title}
						className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6"
					>
						<div className="text-3xl mb-3">{f.icon}</div>
						<h3 className="font-semibold text-white/90">{f.title}</h3>
						<p className="text-white/45 text-sm mt-1.5 leading-relaxed">
							{f.body}
						</p>
					</div>
				))}
			</section>

			{/* How it works */}
			<section className="max-w-4xl mx-auto px-6 py-12">
				<h2 className="text-center text-2xl font-bold text-white/90 mb-10">
					Nasıl çalışır?
				</h2>
				<div className="grid sm:grid-cols-3 gap-6">
					{STEPS.map((s) => (
						<div key={s.n} className="text-center">
							<div className="w-10 h-10 mx-auto rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 font-bold mb-3">
								{s.n}
							</div>
							<h3 className="font-semibold text-white/85">{s.t}</h3>
							<p className="text-white/45 text-sm mt-1">{s.d}</p>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-center text-2xl font-bold text-white/90 mb-10">
					Basit fiyatlandırma
				</h2>
				<div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
					<div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6">
						<p className="text-white/50 text-sm">Free</p>
						<p className="text-3xl font-bold mt-1">$0</p>
						<ul className="mt-5 space-y-2 text-sm text-white/55">
							<li>✓ 1 galaksi</li>
							<li>✓ {FREE_NODE_LIMIT} node</li>
							<li>✓ Public link & paylaşım</li>
							<li>✓ Markdown / Obsidian import</li>
						</ul>
						<Link
							href="/admin/login"
							className="block text-center mt-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-sm font-medium transition-colors"
						>
							Ücretsiz başla
						</Link>
					</div>
					<div className="bg-purple-500/[0.08] border border-purple-400/25 rounded-2xl p-6">
						<p className="text-purple-300 text-sm">Pro</p>
						<p className="text-3xl font-bold mt-1">
							{PRO_PRICE_LABEL}
						</p>
						<ul className="mt-5 space-y-2 text-sm text-white/65">
							{PRO_PERKS.map((p) => (
								<li key={p}>✓ {p}</li>
							))}
						</ul>
						<Link
							href="/admin/login"
							className="block text-center mt-6 py-2.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/45 text-sm font-semibold transition-colors"
						>
							Pro&apos;ya geç
						</Link>
					</div>
				</div>
			</section>

			{/* Footer CTA */}
			<footer className="border-t border-white/[0.06] mt-12">
				<div className="max-w-3xl mx-auto text-center px-6 py-16">
					<h2 className="text-2xl font-bold text-white/90">
						Galaksini bugün kur
					</h2>
					<Link
						href="/admin/login"
						className="inline-block mt-6 px-6 py-3 rounded-full bg-purple-500/30 hover:bg-purple-500/45 border border-purple-400/30 font-semibold transition-colors"
					>
						Ücretsiz başla →
					</Link>
					<p className="text-white/25 text-xs mt-10">
						<span className="text-purple-400/70">✦</span> {BRAND}
					</p>
				</div>
			</footer>
		</div>
	)
}
