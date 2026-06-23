import { headers, cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { workspaces, members, type Workspace } from "@/db/schema"
import { auth } from "@/lib/auth"
import type { FocusMode } from "@/lib/types"

export const ACTIVE_WS_COOKIE = "active_ws"

export interface ActiveMembership {
	workspace: Workspace
	role: string
}

/**
 * Giriş yapan kullanıcının AKTİF workspace'i + rolü.
 * Aktif workspace cookie ile seçilir; yoksa kullanıcının ilk üyeliği.
 * Üyeliğe dayanır — izolasyonun ve takım erişiminin tek kapısı.
 */
export async function getActiveMembership(): Promise<ActiveMembership> {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) throw new Error("UNAUTHENTICATED")

	const rows = await db
		.select({ workspace: workspaces, role: members.role })
		.from(members)
		.innerJoin(workspaces, eq(workspaces.id, members.workspaceId))
		.where(eq(members.userId, session.user.id))

	if (rows.length === 0) throw new Error("NO_WORKSPACE")

	const cookieStore = await cookies()
	const activeId = cookieStore.get(ACTIVE_WS_COOKIE)?.value
	const active = rows.find((r) => r.workspace.id === activeId) ?? rows[0]
	return { workspace: active.workspace, role: active.role }
}

export async function requireWorkspace(): Promise<Workspace> {
	return (await getActiveMembership()).workspace
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

/** Özel domain (Host) → workspace. Custom domain routing için. */
export async function getWorkspaceByDomain(
	host: string,
): Promise<Workspace | null> {
	const clean = host.toLowerCase().replace(/:\d+$/, "")
	const [ws] = await db
		.select()
		.from(workspaces)
		.where(eq(workspaces.customDomain, clean))
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
