import type { Metadata } from "next"
import { headers } from "next/headers"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"
import { getWorkspaceByDomain } from "@/lib/tenant"
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
		const description = `${ws.name}'in gezilebilir bilgi galaksisi.`
		return {
			title,
			description,
			openGraph: { title, description, type: "website" },
			twitter: { card: "summary_large_image", title, description },
		}
	}
	return {
		title: `${BRAND} — kolektif bilgi evreni`,
		description: BRAND_TAGLINE,
	}
}

// Kök:
//  - Host özel bir domain'e bağlıysa → o workspace'in kendi graph'ı
//  - Değilse → tüm beyinlerin birleştiği "evren" (kolektif samanyolu)
export default async function RootPage() {
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
			/>
		)
	}

	const universe = await getUniverseGraph()
	return <UniverseClient data={universe} />
}
