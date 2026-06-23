import { getMyWorkspace } from "@/actions/admin"
import ThemePicker from "@/components/admin/ThemePicker"

export const dynamic = "force-dynamic"

export default async function AppearancePage() {
	const ws = await getMyWorkspace()

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Görünüm</h1>
			<p className="text-white/30 text-sm mb-6">
				Public galaksinin temasını seç
			</p>
			<ThemePicker current={ws.theme} plan={ws.plan} />
		</div>
	)
}
