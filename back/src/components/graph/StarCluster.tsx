// Yükleniyor göstergesi: dönen spinner yerine nefes alan bir yıldız kümesi.
// Renk workspace temasından gelir (--accent), sabit mor değil.

// Deterministik konumlar — her render aynı, hydration uyuşmazlığı olmaz.
const DOTS = [
	{ x: 50, y: 8, s: 5, d: 0 },
	{ x: 82, y: 28, s: 4, d: 160 },
	{ x: 92, y: 62, s: 3, d: 320 },
	{ x: 71, y: 88, s: 5, d: 480 },
	{ x: 38, y: 95, s: 3, d: 640 },
	{ x: 10, y: 74, s: 4, d: 800 },
	{ x: 4, y: 38, s: 3, d: 960 },
	{ x: 26, y: 12, s: 4, d: 1120 },
	{ x: 56, y: 46, s: 6, d: 240 },
	{ x: 34, y: 58, s: 3, d: 560 },
]

export default function StarCluster({ label }: { label?: string }) {
	return (
		<div className="text-center">
			<div className="relative w-24 h-24 mx-auto">
				{DOTS.map((dot, i) => (
					<span
						key={i}
						className="absolute rounded-full"
						style={{
							left: `${dot.x}%`,
							top: `${dot.y}%`,
							width: dot.s,
							height: dot.s,
							background: "var(--accent)",
							boxShadow: "0 0 12px -2px var(--accent)",
							animation: `breathe 2600ms var(--ease-out-soft) ${dot.d}ms infinite`,
						}}
					/>
				))}
			</div>
			{label && (
				<p className="mt-5 text-sm tracking-[0.18em] uppercase text-[var(--text-3)]">
					{label}
				</p>
			)}
		</div>
	)
}
