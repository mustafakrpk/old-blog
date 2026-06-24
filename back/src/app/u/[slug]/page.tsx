import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { follows } from "@/db/schema"
import HomeClient from "@/app/home-client"
import MadeWithBadge from "@/components/MadeWithBadge"
import FollowButton from "@/components/FollowButton"
import { getGraphData } from "@/actions/graph"
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
	const description = `${ws.name}'in gezilebilir bilgi galaksisini keşfet.`
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
			{ws.plan === "free" && <MadeWithBadge />}
		</>
	)
}
