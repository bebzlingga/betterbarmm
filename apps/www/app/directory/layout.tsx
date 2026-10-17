import type { Metadata } from 'next'

// Hidden for now: out of the menus and the sitemap, and kept out of search results, though the pages still answer.
export const metadata: Metadata = { robots: { index: false, follow: true } }

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
	return children
}
