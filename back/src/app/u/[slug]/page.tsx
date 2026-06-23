import { notFound } from "next/navigation"
import type { Metadata } from "next"
import HomeClient from "@/app/home-client"
import { getGraphData } from "@/actions/graph"
import { getWorkspaceBySlug } from "@/lib/tenant"

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
	return {
		title: `${ws.name} — Knowledge Galaxy`,
		description: `Explore ${ws.name}'s knowledge graph.`,
	}
}

export default async function PublicGraphPage({ params }: PageProps) {
	const { slug } = await params
	const ws = await getWorkspaceBySlug(slug)
	if (!ws) notFound()

	// Public ziyaretçi workspace'in izin verdiği en yüksek modu görür.
	const initialData = await getGraphData(slug, ws.defaultMode)

	return (
		<HomeClient
			initialData={initialData}
			slug={slug}
			initialMode={ws.defaultMode}
		/>
	)
}
