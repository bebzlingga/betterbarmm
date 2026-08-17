import type { Metadata } from 'next'
import { CategoryPage } from '../_components/category-page'

export const metadata: Metadata = {
	title: 'Journal',
	description:
		'The Bangsamoro Parliament’s official session record — attendance, motions, debate, and votes.',
}

export default function JournalPage() {
	return <CategoryPage slug='journal' />
}
