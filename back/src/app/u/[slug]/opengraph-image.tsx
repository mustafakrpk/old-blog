import { ImageResponse } from "next/og"
import { count, eq } from "drizzle-orm"
import { db } from "@/db"
import { nodes } from "@/db/schema"
import { getWorkspaceBySlug } from "@/lib/tenant"
import { BRAND } from "@/lib/brand"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"

export default async function OpengraphImage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const ws = await getWorkspaceBySlug(slug)
	const name = ws?.name ?? BRAND

	let nodeCount = 0
	if (ws) {
		const [c] = await db
			.select({ count: count() })
			.from(nodes)
			.where(eq(nodes.workspaceId, ws.id))
		nodeCount = c.count
	}

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background:
						"radial-gradient(circle at 50% 40%, #1a1040 0%, #000011 65%)",
					color: "white",
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{ display: "flex", fontSize: 30, color: "#b794f6", marginBottom: 8 }}
				>
					{BRAND}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 76,
						fontWeight: 800,
						textAlign: "center",
						padding: "0 80px",
						lineHeight: 1.1,
					}}
				>
					{name}
				</div>
				<div
					style={{
						display: "flex",
						fontSize: 30,
						color: "rgba(255,255,255,0.55)",
						marginTop: 20,
					}}
				>
					{`${nodeCount} node - gezilebilir bilgi galaksisi`}
				</div>
			</div>
		),
		size,
	)
}
