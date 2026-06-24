"use client"

import { useEffect } from "react"
import { markNotificationsRead } from "@/actions/notifications"

// Bildirimler sayfası açılınca tümünü okundu işaretle.
export default function MarkRead() {
	useEffect(() => {
		markNotificationsRead().catch(() => {})
	}, [])
	return null
}
