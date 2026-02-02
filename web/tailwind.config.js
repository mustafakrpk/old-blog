/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				surface: {
					DEFAULT: "#000000",
					50: "#0a0a0a",
					100: "#111111",
					200: "#1a1a1a",
					300: "#222222",
					400: "#2a2a2a",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
			},
			backdropBlur: {
				"3xl": "64px",
			},
		},
	},
	plugins: [],
}
