"use client"

import { useState, useTransition } from "react"
import { toggleFollow } from "@/actions/social"

export default function FollowButton({
	targetSlug,
	initialFollowing,
}: {
	targetSlug: string
	initialFollowing: boolean
}) {
	const [following, setFollowing] = useState(initialFollowing)
	const [pending, startTransition] = useTransition()

	function toggle() {
		startTransition(async () => {
			try {
				const next = await toggleFollow(targetSlug)
				setFollowing(next)
			} catch {
				/* yoksay */
			}
		})
	}

	return (
		<button
			onClick={toggle}
			disabled={pending}
			className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border transition-colors disabled:opacity-50 ${
				following
					? "bg-white/[0.08] border-white/[0.15] text-white/70 hover:text-white/90"
					: "bg-purple-500/30 border-purple-400/40 text-white hover:bg-purple-500/45"
			}`}
		>
			{following ? "Following ✓" : "+ Follow"}
		</button>
	)
}
