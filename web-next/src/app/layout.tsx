import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Mustafa Kirpik | Digital Garden",
	description:
		"An interactive knowledge graph of projects, skills, and ideas.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${inter.variable} font-sans bg-black text-white antialiased`}
			>
				{children}
			</body>
		</html>
	)
}
