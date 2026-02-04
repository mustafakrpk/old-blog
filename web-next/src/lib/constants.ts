export const TYPE_COLORS: Record<string, string> = {
	hub: "#ffffff",
	note: "#a78bfa",
	blog: "#3b82f6",
	project: "#10b981",
	skill: "#f59e0b",
	resource: "#06b6d4",
	hobby: "#ec4899",
	dataset: "#6366f1",
}

export const CLUSTER_POSITIONS: Record<string, { x: number; y: number }> = {
	core: { x: 0, y: 0 },
	career: { x: 0, y: -300 },
	library: { x: 300, y: 0 },
	playground: { x: 0, y: 300 },
	life: { x: -300, y: 0 },
}

export const CLUSTER_LABELS: Record<string, string> = {
	core: "Core",
	career: "Career & Tech",
	library: "Library & Writing",
	playground: "Playground & Apps",
	life: "Life & Hobbies",
}

export const MODE_CONFIG: Record<
	string,
	{ label: string; description: string; icon: string }
> = {
	professional: {
		label: "Professional",
		description: "Core skills & projects",
		icon: "briefcase",
	},
	explorer: {
		label: "Explorer",
		description: "Blog posts & deep dives",
		icon: "compass",
	},
	god_mode: {
		label: "God Mode",
		description: "Everything + datasets",
		icon: "zap",
	},
}
