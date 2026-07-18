"use server"

import { headers, cookies } from "next/headers"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { workspaces, members } from "@/db/schema"
import { auth } from "@/lib/auth"
import { ACTIVE_WS_COOKIE } from "@/lib/tenant"
import { slugify } from "@/lib/slug"

async function currentUserId(): Promise<string> {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) throw new Error("UNAUTHENTICATED")
	return session.user.id
}

const COOKIE_OPTS = {
	httpOnly: true,
	sameSite: "lax" as const,
	path: "/",
	maxAge: 60 * 60 * 24 * 365,
}

/** Kullanıcının üye olduğu tüm workspace'ler (switcher için). */
export async function listMyWorkspaces() {
	const uid = await currentUserId()
	const rows = await db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			role: members.role,
		})
		.from(members)
		.innerJoin(workspaces, eq(workspaces.id, members.workspaceId))
		.where(eq(members.userId, uid))

	const cookieStore = await cookies()
	const activeId = cookieStore.get(ACTIVE_WS_COOKIE)?.value ?? rows[0]?.id
	return rows.map((r) => ({ ...r, active: r.id === activeId }))
}

/** Aktif workspace'i değiştirir (üyelik doğrulanır). */
export async function setActiveWorkspace(id: string) {
	const uid = await currentUserId()
	const [m] = await db
		.select()
		.from(members)
		.where(and(eq(members.userId, uid), eq(members.workspaceId, id)))
		.limit(1)
	if (!m) throw new Error("NOT_A_MEMBER")

	const cookieStore = await cookies()
	cookieStore.set(ACTIVE_WS_COOKIE, id, COOKIE_OPTS)
	revalidatePath("/admin")
}

/** Yeni (takım) workspace oluşturur ve aktif yapar. */
export async function createWorkspace(name: string) {
	const uid = await currentUserId()
	const clean = name.trim() || "Team"
	const wsId = randomUUID()
	const slug = `${slugify(clean)}-${randomUUID().slice(0, 6)}`

	await db.insert(workspaces).values({
		id: wsId,
		ownerId: uid,
		slug,
		name: clean,
		plan: "free",
		defaultMode: "professional",
	})
	await db.insert(members).values({
		workspaceId: wsId,
		userId: uid,
		role: "owner",
	})

	const cookieStore = await cookies()
	cookieStore.set(ACTIVE_WS_COOKIE, wsId, COOKIE_OPTS)
	revalidatePath("/admin")
	return { id: wsId, slug }
}
