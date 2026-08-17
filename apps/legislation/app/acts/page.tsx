import type { Metadata } from 'next'
import { CategoryPage } from '../_components/category-page'

export const metadata: Metadata = {
	title: 'Bangsamoro Autonomy Acts',
	description:
		'Every Bangsamoro Autonomy Act ratified since 2019, with sectors, amendment chains, source documents, and plain-language summaries.',
}

export default function ActsPage() {
	return <CategoryPage slug='acts' />
}
