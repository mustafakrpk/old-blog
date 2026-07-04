import { ImageResponse } from "next/og"
import { count, eq } from "drizzle-orm"
import { db } from "@/db"
import { nodes } from "@/db/schema"
import { getWorkspaceBySlug } from "@/lib/tenant"
import { getTheme } from "@/lib/themes"
import { BRAND } from "@/lib/brand"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"

// Sabit yıldız konumları (deterministik — her render aynı).
const STARS = [
	{ x: 8, y: 14, s: 3, o: 0.5 },
	{ x: 18, y: 40, s: 2, o: 0.35 },
	{ x: 12, y: 72, s: 4, o: 0.6 },
	{ x: 26, y: 22, s: 2, o: 0.3 },
	{ x: 33, y: 62, s: 3, o: 0.45 },
	{ x: 44, y: 12, s: 2, o: 0.35 },
	{ x: 52, y: 80, s: 3, o: 0.5 },
	{ x: 61, y: 20, s: 2, o: 0.3 },
	{ x: 68, y: 58, s: 4, o: 0.55 },
	{ x: 74, y: 30, s: 2, o: 0.35 },
	{ x: 82, y: 74, s: 3, o: 0.5 },
	{ x: 88, y: 18, s: 2, o: 0.3 },
	{ x: 92, y: 48, s: 3, o: 0.45 },
	{ x: 40, y: 86, s: 2, o: 0.3 },
	{ x: 57, y: 40, s: 2, o: 0.25 },
	{ x: 22, y: 88, s: 3, o: 0.4 },
	{ x: 78, y: 90, s: 2, o: 0.3 },
	{ x: 6, y: 54, s: 2, o: 0.35 },
]

export default async function OpengraphImage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const ws = await getWorkspaceBySlug(slug)
	const name = ws?.name ?? BRAND
	const theme = getTheme(ws?.theme)

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
					position: "relative",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: `radial-gradient(circle at 50% 42%, ${theme.accent}22 0%, ${theme.bg} 60%)`,
					color: "white",
					fontFamily: "sans-serif",
				}}
			>
				{/* stars */}
				{STARS.map((st, i) => (
					<div
						key={i}
						style={{
							position: "absolute",
							left: `${st.x}%`,
							top: `${st.y}%`,
							width: st.s,
							height: st.s,
							borderRadius: st.s,
							background: "#ffffff",
							opacity: st.o,
						}}
					/>
				))}

				{/* brand */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						fontSize: 30,
						color: theme.accent,
						marginBottom: 14,
					}}
				>
					✦ {BRAND}
				</div>

				{/* name */}
				<div
					style={{
						display: "flex",
						fontSize: 82,
						fontWeight: 800,
						textAlign: "center",
						padding: "0 80px",
						lineHeight: 1.05,
					}}
				>
					{name}
				</div>

				{/* subtitle */}
				<div
					style={{
						display: "flex",
						fontSize: 30,
						color: "rgba(255,255,255,0.6)",
						marginTop: 22,
					}}
				>
					{nodeCount > 0
						? `${nodeCount} stars · a world you can explore`
						: "a world you can explore"}
				</div>
			</div>
		),
		size,
	)
}
