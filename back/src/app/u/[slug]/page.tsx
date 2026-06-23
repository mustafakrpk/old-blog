import { notFound } from "next/navigation"
import type { Metadata } from "next"
import HomeClient from "@/app/home-client"
import MadeWithBadge from "@/components/MadeWithBadge"
import { getGraphData } from "@/actions/graph"
import { getWorkspaceBySlug } from "@/lib/tenant"
import { BRAND } from "@/lib/brand"

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

	return (
		<>
			<HomeClient
				initialData={initialData}
				slug={slug}
				initialMode={ws.defaultMode}
			/>
			{ws.plan === "free" && <MadeWithBadge />}
		</>
	)
}
