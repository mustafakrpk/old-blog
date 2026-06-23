import { getTeam } from "@/actions/team"
import TeamClient from "@/components/admin/TeamClient"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
	const team = await getTeam()

	return (
		<div className="p-8 max-w-3xl">
			<h1 className="text-2xl font-bold text-white/90 mb-1">Takım</h1>
			<p className="text-white/30 text-sm mb-6">
				{team.workspaceName} · üyeler ve davetler
			</p>
			<TeamClient
				myRole={team.myRole}
				members={team.members}
				pending={team.pending}
			/>
		</div>
	)
}
