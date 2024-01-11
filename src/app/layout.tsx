import type { Metadata } from 'next'
import '@/styles/reset.css'
import '@/styles/globals.scss'


export const metadata: Metadata = {
	title: 'Builder',
	description: 'Website Builder',
}


export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
