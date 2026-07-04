import { getMyWorkspace } from "@/actions/admin"
import ThemePicker from "@/components/admin/ThemePicker"
import ListedToggle from "@/components/admin/ListedToggle"

export const dynamic = "force-dynamic"

export default async function AppearancePage() {
	const ws = await getMyWorkspace()

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Appearance</h1>
			<p className="text-white/30 text-sm mb-6">
				Choose the theme for your public galaxy
			</p>
			<ThemePicker current={ws.theme} plan={ws.plan} />

			<h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mt-10 mb-3">
				Privacy
			</h2>
			<ListedToggle initial={ws.listed} />
		</div>
	)
}
