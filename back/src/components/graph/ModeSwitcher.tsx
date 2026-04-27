"use client"

import { MODE_CONFIG } from "@/lib/constants"
import type { FocusMode } from "@/lib/types"

interface ModeSwitcherProps {
	currentMode: FocusMode
	onModeChange: (mode: FocusMode) => void
	loading?: boolean
	nodeCounts?: Record<string, number>
}

const modes: FocusMode[] = ["professional", "explorer", "god_mode"]

export default function ModeSwitcher({
	currentMode,
	onModeChange,
	loading,
	nodeCounts,
}: ModeSwitcherProps) {
	return (
		<div className="fixed top-5 left-5 z-30">
			<div className="flex gap-1 p-1 rounded-xl bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08]">
				{modes.map((mode) => {
					const config = MODE_CONFIG[mode]
					const isActive = currentMode === mode
					return (
						<button
							key={mode}
							onClick={() => onModeChange(mode)}
							disabled={loading}
							className={`
								relative px-4 py-2 rounded-lg text-xs font-medium
								transition-all duration-300 whitespace-nowrap
								${
									isActive
										? "bg-white/[0.12] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
										: "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
								}
								${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}
							`}
						>
							<span>{config.label}</span>
							{nodeCounts?.[mode] !== undefined && (
								<span
									className={`ml-1.5 text-[10px] ${isActive ? "text-white/50" : "text-white/20"}`}
								>
									{nodeCounts[mode]}
								</span>
							)}
							{isActive && (
								<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white/30" />
							)}
						</button>
					)
				})}
			</div>
			<p className="text-white/15 text-[10px] mt-1.5 ml-1">
				{MODE_CONFIG[currentMode].description}
			</p>
		</div>
	)
}
