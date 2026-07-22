import type { Metadata } from "next"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { follows } from "@/db/schema"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"
import { getWorkspaceByDomain, getOptionalWorkspace } from "@/lib/tenant"
import { getGraphData, getUniverseGraph } from "@/actions/graph"
import { getTheme } from "@/lib/themes"
import HomeClient from "@/app/home-client"
import UniverseClient from "@/components/UniverseClient"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
	const host = (await headers()).get("host") ?? ""
	const ws = await getWorkspaceByDomain(host)
	if (ws) {
		const title = `${ws.name} — ${BRAND}`
		const description = `${ws.name}'s explorable knowledge galaxy.`
		return {
			title,
			description,
			openGraph: { title, description, type: "website" },
			twitter: { card: "summary_large_image", title, description },
		}
	}
	return {
		title: `${BRAND} — the collective knowledge universe`,
		description: BRAND_TAGLINE,
	}
}

// Kök:
//  - Host özel bir domain'e bağlıysa → o workspace'in kendi graph'ı
//  - Değilse → "evren" (kolektif) veya "ağım" (takip edilenler)
export default async function RootPage({
	searchParams,
}: {
	searchParams: Promise<{ view?: string }>
}) {
	const host = (await headers()).get("host") ?? ""
	const ws = await getWorkspaceByDomain(host)

	if (ws) {
		const initialData = await getGraphData(ws.slug, ws.defaultMode)
		const theme = getTheme(ws.theme)
		return (
			<HomeClient
				initialData={initialData}
				slug={ws.slug}
				initialMode={ws.defaultMode}
				bg={theme.bg}
				accent={theme.accent}
			/>
		)
	}

	const me = await getOptionalWorkspace()
	const view = (await searchParams).view
	const networkView = view === "network" && Boolean(me)

	let universe
	if (networkView && me) {
		const followed = await db
			.select({ id: follows.followingId })
			.from(follows)
			.where(eq(follows.followerId, me.id))
		universe = await getUniverseGraph({
			onlyWorkspaceIds: [me.id, ...followed.map((f) => f.id)],
		})
	} else {
		universe = await getUniverseGraph()
	}

	return (
		<UniverseClient
			data={universe}
			loggedIn={Boolean(me)}
			view={networkView ? "network" : "all"}
		/>
	)
}
