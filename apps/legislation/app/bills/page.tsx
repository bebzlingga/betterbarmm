import type { Metadata } from 'next'
import { CategoryPage } from '../_components/category-page'

export const metadata: Metadata = {
	title: 'Bills',
	description:
		'Every bill filed in the Bangsamoro Parliament — searchable by number, title, sector, session, and where it sits in the legislative process.',
}

export default function BillsPage() {
	return <CategoryPage slug='bills' />
}
