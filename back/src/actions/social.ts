"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { follows } from "@/db/schema"
import { requireWorkspace, getWorkspaceBySlug } from "@/lib/tenant"

/**
 * Aktif workspace, hedef slug'ı takip eder/bırakır. Yeni durumu döner (true=takip).
 * Kendini takip edemez.
 */
export async function toggleFollow(targetSlug: string): Promise<boolean> {
	const me = await requireWorkspace()
	const target = await getWorkspaceBySlug(targetSlug)
	if (!target) throw new Error("NOT_FOUND")
	if (target.id === me.id) throw new Error("CANNOT_FOLLOW_SELF")

	const [existing] = await db
		.select()
		.from(follows)
		.where(
			and(
				eq(follows.followerId, me.id),
				eq(follows.followingId, target.id),
			),
		)
		.limit(1)

	if (existing) {
		await db
			.delete(follows)
			.where(
				and(
					eq(follows.followerId, me.id),
					eq(follows.followingId, target.id),
				),
			)
		revalidatePath(`/u/${targetSlug}`)
		return false
	}

	await db
		.insert(follows)
		.values({ followerId: me.id, followingId: target.id })
		.onConflictDoNothing()
	revalidatePath(`/u/${targetSlug}`)
	return true
}
