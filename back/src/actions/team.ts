"use server"

import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { members, invites, user } from "@/db/schema"
import { getActiveMembership } from "@/lib/tenant"

const ROLES = ["owner", "admin", "member"] as const
type Role = (typeof ROLES)[number]

async function requireManager() {
	const { workspace, role } = await getActiveMembership()
	if (role !== "owner" && role !== "admin") throw new Error("FORBIDDEN")
	return workspace
}

async function ownerCount(workspaceId: string): Promise<number> {
	const [c] = await db
		.select({ count: count() })
		.from(members)
		.where(
			and(eq(members.workspaceId, workspaceId), eq(members.role, "owner")),
		)
	return c.count
}

/** Aktif workspace'in üyeleri + bekleyen davetleri + benim rolüm. */
export async function getTeam() {
	const { workspace, role: myRole } = await getActiveMembership()

	const memberRows = await db
		.select({
			userId: members.userId,
			role: members.role,
			name: user.name,
			email: user.email,
		})
		.from(members)
		.innerJoin(user, eq(user.id, members.userId))
		.where(eq(members.workspaceId, workspace.id))

	const pending = await db
		.select({ email: invites.email, role: invites.role })
		.from(invites)
		.where(eq(invites.workspaceId, workspace.id))

	return { myRole, workspaceName: workspace.name, members: memberRows, pending }
}

/** E-posta ile davet. Kullanıcı varsa hemen üye olur, yoksa davet kaydı. */
export async function inviteMember(rawEmail: string, role: string) {
	const ws = await requireManager()
	const email = rawEmail.trim().toLowerCase()
	const r: Role = ROLES.includes(role as Role) ? (role as Role) : "member"
	if (!email) throw new Error("NO_EMAIL")

	const [existing] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, email))
		.limit(1)

	if (existing) {
		await db
			.insert(members)
			.values({ workspaceId: ws.id, userId: existing.id, role: r })
			.onConflictDoNothing()
	} else {
		await db
			.insert(invites)
			.values({ workspaceId: ws.id, email, role: r })
			.onConflictDoUpdate({
				target: [invites.workspaceId, invites.email],
				set: { role: r },
			})
	}
	revalidatePath("/admin/team")
}

export async function updateMemberRole(userId: string, role: string) {
	const ws = await requireManager()
	const r: Role = ROLES.includes(role as Role) ? (role as Role) : "member"

	// Son owner'ı düşürmeyi engelle.
	if (r !== "owner") {
		const [target] = await db
			.select({ role: members.role })
			.from(members)
			.where(and(eq(members.workspaceId, ws.id), eq(members.userId, userId)))
			.limit(1)
		if (target?.role === "owner" && (await ownerCount(ws.id)) <= 1) {
			throw new Error("LAST_OWNER")
		}
	}

	await db
		.update(members)
		.set({ role: r })
		.where(and(eq(members.workspaceId, ws.id), eq(members.userId, userId)))
	revalidatePath("/admin/team")
}

export async function removeMember(userId: string) {
	const ws = await requireManager()

	const [target] = await db
		.select({ role: members.role })
		.from(members)
		.where(and(eq(members.workspaceId, ws.id), eq(members.userId, userId)))
		.limit(1)
	if (target?.role === "owner" && (await ownerCount(ws.id)) <= 1) {
		throw new Error("LAST_OWNER")
	}

	await db
		.delete(members)
		.where(and(eq(members.workspaceId, ws.id), eq(members.userId, userId)))
	revalidatePath("/admin/team")
}

export async function cancelInvite(email: string) {
	const ws = await requireManager()
	await db
		.delete(invites)
		.where(
			and(eq(invites.workspaceId, ws.id), eq(invites.email, email)),
		)
	revalidatePath("/admin/team")
}
