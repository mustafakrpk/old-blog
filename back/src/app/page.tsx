import type { Metadata } from "next"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { follows } from "@/db/schema"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"
import { getWorkspaceByDomain, getOptionalWorkspace } from "@/lib/tenant"
import { getGraphData, getUniverseGraph } from "@/actions/graph"
import {
	buildPreviewUniverse,
	parsePreviewParam,
	BACKDROP_COUNT,
} from "@/lib/preview-universe"
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
	searchParams: Promise<{ view?: string; preview?: string }>
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
	const sp = await searchParams
	const view = sp.view
	const networkView = view === "network" && Boolean(me)
	// ?preview=<n> → yoğunluk önizlemesi. Yalnızca bellekte üretilir, DB'ye
	// hiçbir şey yazılmaz; parametre yokken kimse bu veriyi görmez.
	const previewCount = parsePreviewParam(sp.preview)

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

	if (previewCount > 0) {
		// Açık density testi — büyük, bağlı, uyarı rozetli.
		const mock = buildPreviewUniverse(previewCount)
		universe = {
			nodes: [...universe.nodes, ...mock.nodes],
			links: [...universe.links, ...mock.links],
		}
	} else if (!networkView) {
		// Varsayılan "all" görünümü: gerçek galaksilerin arkasına soluk bir
		// yıldız alanı serpiştir ki evren boş görünmesin. Bunlar tıklanamaz
		// ve DB'ye yazılmaz; "click a star" hâlâ gerçek galaksilere işaret eder.
		const backdrop = buildPreviewUniverse(BACKDROP_COUNT, { decorative: true })
		universe = {
			nodes: [...universe.nodes, ...backdrop.nodes],
			links: universe.links,
		}
	}

	return (
		<UniverseClient
			data={universe}
			loggedIn={Boolean(me)}
			view={networkView ? "network" : "all"}
			previewCount={previewCount}
		/>
	)
}
