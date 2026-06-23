import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { workspaces, type Workspace } from "@/db/schema"
import { auth } from "@/lib/auth"
import type { FocusMode } from "@/lib/types"

/**
 * Giriş yapan kullanıcının workspace'ini döndürür.
 * Admin action'larının başında çağrılır — izolasyonun tek kapısı.
 * Oturum yoksa veya workspace yoksa hata fırlatır.
 */
export async function requireWorkspace(): Promise<Workspace> {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) throw new Error("UNAUTHENTICATED")

	const [ws] = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.ownerId, session.user.id))
		.limit(1)

	if (!ws) throw new Error("NO_WORKSPACE")
	return ws
}

/** Public okuma için slug'tan workspace bulur (yoksa null). */
export async function getWorkspaceBySlug(
	slug: string,
): Promise<Workspace | null> {
	const [ws] = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.slug, slug))
		.limit(1)
	return ws ?? null
}

// Gizlilik tavanı: public ziyaretçi en fazla workspace.defaultMode kadar görebilir.
const MODE_RANK: Record<FocusMode, number> = {
	professional: 0,
	explorer: 1,
	god_mode: 2,
}

/** İstenen modu workspace'in izin verdiği tavana indirir (clamp). */
export function clampMode(requested: FocusMode, ceiling: FocusMode): FocusMode {
	return MODE_RANK[requested] <= MODE_RANK[ceiling] ? requested : ceiling
}
