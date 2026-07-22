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
	// Alt-sol: üst-sol köşe kimlik çipine (isim + takipçi) bırakıldı.
	// Mobilde alta ortalanır; "Made with" rozeti o ekranlarda yukarı kayar.
	return (
		<div className="fixed z-30 bottom-5 left-1/2 -translate-x-1/2 sm:left-5 sm:translate-x-0 max-w-[calc(100vw-2rem)]">
			<p className="hidden sm:block text-[10px] tracking-[0.14em] uppercase text-[var(--text-4)] mb-2 ml-1">
				{MODE_CONFIG[currentMode].description}
			</p>
			<div className="glass flex gap-1 p-1 rounded-2xl">
				{modes.map((mode) => {
					const config = MODE_CONFIG[mode]
					const isActive = currentMode === mode
					return (
						<button
							key={mode}
							onClick={() => onModeChange(mode)}
							disabled={loading}
							title={config.description}
							className={`
								focus-ring relative px-3 sm:px-4 py-2 rounded-xl text-xs font-medium
								whitespace-nowrap transition-all duration-300
								${
									isActive
										? "text-[var(--text-1)]"
										: "text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--surface-1)]"
								}
								${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}
							`}
							style={
								isActive
									? {
											background: "var(--surface-3)",
											boxShadow: "0 0 24px -10px var(--accent)",
										}
									: undefined
							}
						>
							<span>{config.label}</span>
							{nodeCounts?.[mode] !== undefined && (
								<span
									className={`ml-1.5 text-[10px] ${isActive ? "text-[var(--text-3)]" : "text-[var(--text-4)]"}`}
								>
									{nodeCounts[mode]}
								</span>
							)}
							{isActive && (
								<span
									className="absolute -bottom-px left-1/2 -translate-x-1/2 w-5 h-px rounded-full"
									style={{ background: "var(--accent)" }}
								/>
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
