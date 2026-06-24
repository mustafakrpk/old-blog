"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import WorkspaceSwitcher from "@/components/admin/WorkspaceSwitcher"
import NotificationsNavItem from "@/components/admin/NotificationsNavItem"

const navItems = [
	{ href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
	{ href: "/admin/nodes", label: "Nodes", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
	{ href: "/admin/nodes/new", label: "New Node", icon: "M12 4v16m8-8H4" },
	{ href: "/admin/import", label: "Import", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
	{ href: "/admin/team", label: "Team", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 00-3-3.87" },
	{ href: "/admin/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
	{ href: "/admin/appearance", label: "Appearance", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
	{ href: "/admin/billing", label: "Billing", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()

	// Don't wrap login page with sidebar
	if (pathname === "/admin/login") {
		return <>{children}</>
	}

	async function handleLogout() {
		await signOut()
		router.push("/admin/login")
	}

	return (
		<div className="min-h-screen bg-[#000011] flex">
			{/* Sidebar */}
			<aside className="w-60 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] flex flex-col">
				<WorkspaceSwitcher />

				<nav className="flex-1 px-3 py-4 space-y-1">
					{navItems.map((item) => {
						const isActive = pathname === item.href
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
									isActive
										? "bg-white/[0.08] text-white/90"
										: "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
								}`}
							>
								<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
								</svg>
								{item.label}
							</Link>
						)
					})}
					<NotificationsNavItem />
				</nav>

				<div className="px-3 py-4 border-t border-white/[0.06]">
					<button
						onClick={handleLogout}
						className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-red-400 hover:bg-white/[0.04] transition-colors w-full"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Sign Out
					</button>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-y-auto">
				{children}
			</main>
		</div>
	)
}
