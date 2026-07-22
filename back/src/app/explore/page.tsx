import Link from "next/link"
import type { Metadata } from "next"
import { getPublicWorkspaces } from "@/actions/graph"
import { getTheme, DEFAULT_THEME } from "@/lib/themes"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: `Explore — ${BRAND}`,
	description: "Explore the community's navigable knowledge galaxies.",
}

// Her galaksi kartı kendi yıldız alanını taşır. Konumlar slug'dan türetilir:
// deterministik (sunucu/istemci aynı) ama her workspace'te farklı — kartlar
// artık birbirinin kopyası görünmüyor.
function starfield(seed: string, count: number) {
	let h = 2166136261
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i)
		h = Math.imul(h, 16777619)
	}
	const next = () => {
		h ^= h << 13
		h ^= h >>> 17
		h ^= h << 5
		return ((h >>> 0) % 10000) / 10000
	}
	return Array.from({ length: count }, () => ({
		x: next() * 100,
		y: next() * 100,
		s: 1 + next() * 2.5,
		o: 0.2 + next() * 0.6,
	}))
}

export default async function ExplorePage() {
	const list = await getPublicWorkspaces()

	return (
		<div
			className="min-h-screen text-white"
			style={
				{
					backgroundColor: DEFAULT_THEME.bg,
					"--accent": DEFAULT_THEME.accent,
				} as React.CSSProperties
			}
		>
			<nav className="flex items-center justify-between gap-4 px-5 sm:px-8 py-5 max-w-6xl mx-auto">
				<Link
					href="/"
					className="focus-ring rounded-lg font-semibold tracking-tight display text-lg"
				>
					<span style={{ color: DEFAULT_THEME.accent }}>✦</span> {BRAND}
				</Link>
				<Link
					href="/admin/login"
					className="focus-ring glass px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5"
				>
					Create your galaxy
				</Link>
			</nav>

			{/* Hero — sayfanın ilk ekranında artık bir vaat var */}
			<header className="relative max-w-5xl mx-auto px-6 pt-16 pb-14 text-center overflow-hidden">
				<div
					className="pointer-events-none absolute inset-x-0 top-0 h-64 -z-10"
					style={{
						background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${DEFAULT_THEME.accent}1f 0%, transparent 70%)`,
					}}
				/>
				<h1
					className="display text-4xl sm:text-6xl font-extrabold anim-rise"
					style={{ animationDelay: "80ms" }}
				>
					Explore the universe
				</h1>
				<p
					className="display mx-auto mt-5 max-w-lg text-base sm:text-lg text-[var(--text-2)] anim-rise"
					style={{ animationDelay: "220ms" }}
				>
					{BRAND_TAGLINE}
				</p>
				{list.length > 0 && (
					<p
						className="mt-4 text-sm text-[var(--text-3)] anim-rise"
						style={{ animationDelay: "340ms" }}
					>
						{list.length} {list.length === 1 ? "galaxy" : "galaxies"} to
						wander through
					</p>
				)}
			</header>

			<div className="max-w-6xl mx-auto px-6 pb-24">
				{list.length === 0 ? (
					<div className="glass rounded-3xl p-12 text-center max-w-md mx-auto">
						<p className="text-[var(--text-1)] font-medium">
							No galaxies listed yet
						</p>
						<p className="text-[var(--text-3)] text-sm mt-1.5">
							This corner of the universe is still dark.
						</p>
						<Link
							href="/admin/login"
							className="focus-ring inline-block mt-6 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
							style={{
								background: "var(--surface-3)",
								boxShadow: `0 0 40px -14px ${DEFAULT_THEME.accent}`,
							}}
						>
							Create the first one
						</Link>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{list.map((w, i) => {
							const theme = getTheme(w.theme)
							// Node sayısı arttıkça yıldız alanı yoğunlaşır.
							const stars = starfield(
								w.slug,
								Math.min(38, 10 + Math.round(w.nodes / 3)),
							)
							return (
								<Link
									key={w.slug}
									href={`/u/${w.slug}`}
									className="focus-ring group rounded-3xl overflow-hidden border border-[var(--border-1)] hover:border-[var(--border-2)] transition-all duration-500 hover:-translate-y-1 anim-rise"
									style={{
										animationDelay: `${Math.min(i, 8) * 70 + 200}ms`,
									}}
								>
									<div
										className="relative h-40 overflow-hidden"
										style={{
											background: `radial-gradient(circle at 50% 55%, ${theme.accent}2e 0%, ${theme.bg} 68%)`,
										}}
									>
										{stars.map((st, j) => (
											<span
												key={j}
												className="absolute rounded-full transition-transform duration-700 group-hover:scale-110"
												style={{
													left: `${st.x}%`,
													top: `${st.y}%`,
													width: st.s,
													height: st.s,
													background: "#ffffff",
													opacity: st.o,
												}}
											/>
										))}
										{/* Merkez yıldız = bu galaksinin çekirdeği */}
										<span
											className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all duration-700 group-hover:scale-150"
											style={{
												backgroundColor: theme.accent,
												boxShadow: `0 0 24px 2px ${theme.accent}`,
											}}
										/>
									</div>

									<div className="p-5 bg-[var(--surface-1)]">
										<p className="font-semibold text-[var(--text-1)] truncate display">
											{w.name}
										</p>
										<p className="text-[var(--text-4)] text-xs mt-1">
											/u/{w.slug}
										</p>
										<div className="flex items-center gap-2.5 mt-4 text-xs text-[var(--text-3)]">
											<span>{w.nodes} stars</span>
											<span className="text-[var(--text-4)]">·</span>
											<span>{w.views} views</span>
										</div>
									</div>
								</Link>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
