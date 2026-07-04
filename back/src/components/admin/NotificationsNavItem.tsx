"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getUnreadCount } from "@/actions/notifications"

export default function NotificationsNavItem() {
	const pathname = usePathname()
	const [unread, setUnread] = useState(0)
	const isActive = pathname === "/admin/notifications"

	useEffect(() => {
		getUnreadCount()
			.then(setUnread)
			.catch(() => {})
	}, [pathname])

	return (
		<Link
			href="/admin/notifications"
			className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
				isActive
					? "bg-white/[0.08] text-white/90"
					: "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
			}`}
		>
			<svg
				className="w-4 h-4 flex-shrink-0"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
				/>
			</svg>
			Notifications
			{unread > 0 && (
				<span className="ml-auto text-[10px] font-semibold bg-purple-500/40 text-purple-100 rounded-full px-1.5 py-0.5 min-w-5 text-center">
					{unread}
				</span>
			)}
		</Link>
	)
}
