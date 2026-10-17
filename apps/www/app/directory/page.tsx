import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Directory',
	description:
		'Who heads each office of the Bangsamoro Government and how to reach it, every governor, mayor and punong barangay in BARMM, and the 80 Members of Parliament, in one searchable directory.',
	path: '/directory',
})

/** The index itself is drawn by the layout; with nothing open over it there is nothing more to draw. */
export default function DirectoryPage() {
	return null
}
