"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logoutAction } from "@/actions/admin"

const navItems = [
	{ href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
	{ href: "/admin/nodes", label: "Nodes", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
	{ href: "/admin/nodes/new", label: "New Node", icon: "M12 4v16m8-8H4" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()

	// Don't wrap login page with sidebar
	if (pathname === "/admin/login") {
		return <>{children}</>
	}

	async function handleLogout() {
		await logoutAction()
		router.push("/admin/login")
	}

	return (
		<div className="min-h-screen bg-[#000011] flex">
			{/* Sidebar */}
			<aside className="w-60 flex-shrink-0 border-r border-white/[0.06] bg-white/[0.02] flex flex-col">
				<div className="px-5 py-5 border-b border-white/[0.06]">
					<Link href="/" className="text-white/70 text-sm font-semibold hover:text-white/90 transition-colors">
						Digital Garden
					</Link>
					<p className="text-white/20 text-[10px] mt-0.5">Admin Panel</p>
				</div>

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
