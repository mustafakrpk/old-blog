import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/db"
import { pageViews } from "@/db/schema"
import { getWorkspaceBySlug } from "@/lib/tenant"

export const dynamic = "force-dynamic"

// Public viewer'dan gelen ziyaret beacon'ı. Slug'ı workspace'e çevirip kaydeder.
export async function POST(request: NextRequest) {
	const { slug } = await request.json().catch(() => ({ slug: null }))
	if (!slug || typeof slug !== "string") {
		return NextResponse.json({ ok: false }, { status: 400 })
	}

	const ws = await getWorkspaceBySlug(slug)
	if (!ws) return NextResponse.json({ ok: false }, { status: 404 })

	await db.insert(pageViews).values({ id: randomUUID(), workspaceId: ws.id })
	return NextResponse.json({ ok: true })
}
