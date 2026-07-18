import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { BRAND, BRAND_TAGLINE } from "@/lib/brand"

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: BRAND,
	description: BRAND_TAGLINE,
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
