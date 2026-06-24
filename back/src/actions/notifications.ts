"use server"

import { and, eq, desc, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { notifications } from "@/db/schema"
import { requireWorkspace } from "@/lib/tenant"

/** Aktif workspace'in bildirimleri (yeniden eskiye). */
export async function getNotifications() {
	const ws = await requireWorkspace()
	return db
		.select()
		.from(notifications)
		.where(eq(notifications.workspaceId, ws.id))
		.orderBy(desc(notifications.createdAt))
		.limit(50)
}

/** Okunmamış bildirim sayısı (sidebar rozeti için). */
export async function getUnreadCount(): Promise<number> {
	const ws = await requireWorkspace()
	const [c] = await db
		.select({ c: count() })
		.from(notifications)
		.where(
			and(
				eq(notifications.workspaceId, ws.id),
				eq(notifications.read, false),
			),
		)
	return c.c
}

export async function markNotificationsRead() {
	const ws = await requireWorkspace()
	await db
		.update(notifications)
		.set({ read: true })
		.where(eq(notifications.workspaceId, ws.id))
	revalidatePath("/admin/notifications")
}
