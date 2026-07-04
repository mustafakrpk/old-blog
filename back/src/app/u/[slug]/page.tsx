import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { follows } from "@/db/schema"
import HomeClient from "@/app/home-client"
import MadeWithBadge from "@/components/MadeWithBadge"
import FollowButton from "@/components/FollowButton"
import { getGraphData } from "@/actions/graph"
import { getFollowCounts } from "@/actions/social"
import { getWorkspaceBySlug, getOptionalWorkspace } from "@/lib/tenant"
import { BRAND } from "@/lib/brand"
import { getTheme } from "@/lib/themes"

export const dynamic = "force-dynamic"

interface PageProps {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params
	const ws = await getWorkspaceBySlug(slug)
	if (!ws) return { title: "Not found" }

	const title = `${ws.name} — ${BRAND}`
	const description = `Explore ${ws.name}'s galaxy on ${BRAND}.`
	return {
		title,
		description,
		openGraph: { title, description, type: "website" },
		twitter: { card: "summary_large_image", title, description },
	}
}

export default async function PublicGraphPage({ params }: PageProps) {
	const { slug } = await params
	const ws = await getWorkspaceBySlug(slug)
	if (!ws) notFound()

	// Public ziyaretçi workspace'in izin verdiği en yüksek modu görür.
	const initialData = await getGraphData(slug, ws.defaultMode)
	const theme = getTheme(ws.theme)
	const counts = await getFollowCounts(ws.id)

	// Giriş yapan başka bir kullanıcı → "Bağlan" butonu + mevcut takip durumu.
	const me = await getOptionalWorkspace()
	let showFollow = false
	let isFollowing = false
	if (me && me.id !== ws.id) {
		showFollow = true
		const [f] = await db
			.select()
			.from(follows)
			.where(
				and(eq(follows.followerId, me.id), eq(follows.followingId, ws.id)),
			)
			.limit(1)
		isFollowing = Boolean(f)
	}

	return (
		<>
			<HomeClient
				initialData={initialData}
				slug={slug}
				initialMode={ws.defaultMode}
				bg={theme.bg}
			/>
			{showFollow && (
				<FollowButton targetSlug={slug} initialFollowing={isFollowing} />
			)}

			{/* Takipçi / takip çipi */}
			<div className="fixed top-4 left-4 z-40 flex items-center gap-3 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] px-4 py-2 text-xs text-white/70">
				<span className="font-medium text-white/90">{ws.name}</span>
				<span>
					<b className="text-white/90">{counts.followers}</b> followers
				</span>
				<span>
					<b className="text-white/90">{counts.following}</b> following
				</span>
			</div>

			{ws.plan === "free" && <MadeWithBadge />}
		</>
	)
}
