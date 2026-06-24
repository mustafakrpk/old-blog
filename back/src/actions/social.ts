"use server"

import { and, eq, count } from "drizzle-orm"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { follows, notifications } from "@/db/schema"
import { requireWorkspace, getWorkspaceBySlug } from "@/lib/tenant"

/** Bir workspace'in takipçi + takip ettiği sayısı. */
export async function getFollowCounts(workspaceId: string) {
	const [followers] = await db
		.select({ c: count() })
		.from(follows)
		.where(eq(follows.followingId, workspaceId))
	const [following] = await db
		.select({ c: count() })
		.from(follows)
		.where(eq(follows.followerId, workspaceId))
	return { followers: followers.c, following: following.c }
}

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

	// Hedefe bildirim: "X seni takip etti"
	await db.insert(notifications).values({
		id: randomUUID(),
		workspaceId: target.id,
		type: "follow",
		actorSlug: me.slug,
		actorName: me.name,
	})

	revalidatePath(`/u/${targetSlug}`)
	return true
}
