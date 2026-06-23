import Link from "next/link"
import type { Metadata } from "next"
import { getPublicWorkspaces } from "@/actions/graph"
import { getTheme } from "@/lib/themes"
import { BRAND } from "@/lib/brand"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: `Keşfet — ${BRAND}`,
	description: "Topluluğun gezilebilir bilgi galaksilerini keşfet.",
}

export default async function ExplorePage() {
	const list = await getPublicWorkspaces()

	return (
		<div className="min-h-screen bg-[#000011] text-white">
			<nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
				<Link href="/" className="font-semibold tracking-tight">
					<span className="text-purple-400">✦</span> {BRAND}
				</Link>
				<Link
					href="/admin/login"
					className="px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-sm transition-colors"
				>
					Kendi galaksini yap
				</Link>
			</nav>

			<div className="max-w-5xl mx-auto px-6 py-10">
				<h1 className="text-3xl font-extrabold tracking-tight">Keşfet</h1>
				<p className="text-white/45 mt-2 mb-8">
					Topluluğun gezilebilir bilgi galaksileri.
				</p>

				{list.length === 0 ? (
					<div className="text-white/40 text-sm bg-white/[0.04] border border-white/[0.07] rounded-xl p-8 text-center">
						Henüz listelenen bir galaksi yok. İlk sen ol →{" "}
						<Link href="/admin/login" className="text-purple-300 underline">
							galaksini yap
						</Link>
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{list.map((w) => {
							const theme = getTheme(w.theme)
							return (
								<Link
									key={w.slug}
									href={`/u/${w.slug}`}
									className="group rounded-2xl border border-white/[0.08] hover:border-white/20 overflow-hidden transition-all"
								>
									<div
										className="h-28 flex items-center justify-center relative"
										style={{
											background: `radial-gradient(circle at 50% 50%, ${theme.accent}33 0%, ${theme.bg} 70%)`,
										}}
									>
										<span
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: theme.accent }}
										/>
									</div>
									<div className="p-4">
										<p className="font-semibold text-white/90 truncate">
											{w.name}
										</p>
										<p className="text-white/35 text-xs mt-0.5">/u/{w.slug}</p>
										<div className="flex items-center gap-3 mt-3 text-xs text-white/40">
											<span>{w.nodes} node</span>
											<span>·</span>
											<span>{w.views} ziyaret</span>
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
