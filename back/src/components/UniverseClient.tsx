"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import KnowledgeGraph3D from "@/components/graph/KnowledgeGraph3D"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"
import { DEFAULT_THEME } from "@/lib/themes"
import { PREVIEW_PREFIX } from "@/lib/preview-universe"
import type { GraphData, GraphNode } from "@/lib/types"

export default function UniverseClient({
	data,
	loggedIn = false,
	view = "all",
	previewCount = 0,
}: {
	data: GraphData
	loggedIn?: boolean
	view?: "all" | "network"
	previewCount?: number
}) {
	const router = useRouter()
	// Sinematik giriş: siyah → yıldızlar belirir → başlık yükselir.
	const [entered, setEntered] = useState(false)

	useEffect(() => {
		const t = setTimeout(() => setEntered(true), 60)
		return () => clearTimeout(t)
	}, [])

	function handleNodeClick(node: GraphNode) {
		// node.id = slug → o kişinin galaksisine git
		const slug = String(node.id)
		// Önizleme yıldızlarının karşılığı yok — tıklayınca 404'e gitmesin.
		if (slug.startsWith(PREVIEW_PREFIX)) return
		if (slug) router.push(`/u/${slug}`)
	}

	const empty = data.nodes.length === 0
	const accent = DEFAULT_THEME.accent

	return (
		// w-screen (=100vw) dikey kaydırma çubuğu varken yatay taşma yaratabiliyor.
		<div
			className="relative w-full h-screen overflow-hidden"
			style={
				{
					backgroundColor: DEFAULT_THEME.bg,
					"--accent": accent,
				} as React.CSSProperties
			}
		>
			<div
				className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
				style={{ opacity: entered ? 1 : 0 }}
			>
				<KnowledgeGraph3D
					graphData={data}
					onNodeClick={handleNodeClick}
					backgroundColor={DEFAULT_THEME.bg}
					nodeLabelHtml={(n) =>
						`<b>${n.title}</b><br/><span style="color:${accent}">${n.val} node</span>`
					}
				/>
			</div>

			{/* Okunabilirlik katmanları — metin parlak bir yıldızın üstüne
			    denk geldiğinde de okunur kalsın. */}
			<div className="pointer-events-none absolute inset-0 z-10 vignette" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 z-10 scrim-top" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-10 scrim-bottom" />

			{/* Üst bar */}
			<nav className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-4 px-5 sm:px-8 py-5 anim-fade">
				<Link
					href="/"
					className="focus-ring rounded-lg font-semibold tracking-tight text-[var(--text-1)] display text-lg"
				>
					<span style={{ color: accent }}>✦</span> {BRAND}
				</Link>

				<div className="flex items-center gap-1 sm:gap-4 text-sm">
					{/* Dar ekranda linkler gizlenir — nav taşmasın, CTA kalsın. */}
					<Link
						href="/explore"
						className="focus-ring rounded-lg hidden sm:inline text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
					>
						Explore
					</Link>
					<Link
						href="/welcome"
						className="focus-ring rounded-lg hidden md:inline text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
					>
						How it works
					</Link>
					<Link
						href="/admin/login"
						className="focus-ring rounded-lg hidden sm:inline text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
					>
						Sign in
					</Link>
					<Link
						href="/admin/login"
						className="focus-ring glass px-4 py-2 rounded-full text-[var(--text-1)] whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5"
						style={{ boxShadow: `0 0 40px -18px ${accent}` }}
					>
						Create your galaxy
					</Link>
				</div>
			</nav>

			{/* Hero */}
			<div className="absolute inset-x-0 top-[17%] sm:top-[19%] z-20 text-center px-6 pointer-events-none">
				<h1
					className="display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-1)] anim-rise"
					style={{ animationDelay: "200ms" }}
				>
					{view === "network" ? "Your network" : "One universe, every mind"}
				</h1>

				<p
					className="display mx-auto mt-5 max-w-xl text-base sm:text-lg text-[var(--text-2)] anim-rise"
					style={{ animationDelay: "400ms" }}
				>
					{BRAND_TAGLINE}
				</p>

				<p
					className="mt-3 text-xs sm:text-sm text-[var(--text-3)] anim-rise"
					style={{ animationDelay: "550ms" }}
				>
					Each color is one mind. Click a star to enter their galaxy.
				</p>

				{loggedIn && (
					<div
						className="glass inline-flex mt-6 rounded-full p-1 pointer-events-auto anim-rise"
						style={{ animationDelay: "700ms" }}
					>
						<Link
							href="/"
							className={`focus-ring px-4 py-1.5 rounded-full text-xs transition-colors ${
								view === "all"
									? "bg-[var(--surface-3)] text-[var(--text-1)]"
									: "text-[var(--text-3)] hover:text-[var(--text-2)]"
							}`}
						>
							All
						</Link>
						<Link
							href="/?view=network"
							className={`focus-ring px-4 py-1.5 rounded-full text-xs transition-colors ${
								view === "network"
									? "bg-[var(--surface-3)] text-[var(--text-1)]"
									: "text-[var(--text-3)] hover:text-[var(--text-2)]"
							}`}
						>
							My network
						</Link>
					</div>
				)}
			</div>

			{/* Önizleme modu göstergesi — sahte veriyi gerçek sanma diye. */}
			{previewCount > 0 && (
				<div className="glass fixed bottom-5 left-1/2 -translate-x-1/2 z-40 rounded-full px-4 py-2 text-xs text-[var(--text-2)] whitespace-nowrap">
					<span className="text-amber-300">●</span> Density preview —{" "}
					{previewCount} mock galaxies, not saved.{" "}
					<Link href="/" className="focus-ring underline">
						exit
					</Link>
				</div>
			)}

			{/* Boş evren — artık çıkışı olan bir davet */}
			{empty && (
				<div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center px-6 pb-24 sm:pb-0 pointer-events-none">
					<div
						className="glass-2 rounded-3xl px-8 py-7 text-center max-w-sm pointer-events-auto anim-rise"
						style={{ animationDelay: "800ms" }}
					>
						<p className="text-[var(--text-1)] font-medium">
							The universe is empty
						</p>
						<p className="text-[var(--text-3)] text-sm mt-1.5">
							No galaxies have been published yet.
						</p>
						<Link
							href="/admin/login"
							className="focus-ring inline-block mt-5 px-5 py-2.5 rounded-full text-sm font-medium text-[var(--text-1)] transition-all duration-300 hover:-translate-y-0.5"
							style={{
								background: "var(--surface-3)",
								boxShadow: `0 0 40px -14px ${accent}`,
							}}
						>
							Be the first star
						</Link>
					</div>
				</div>
			)}
		</div>
	)
}
