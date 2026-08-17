import type { Metadata } from 'next'
import { CategoryPage } from '../_components/category-page'

export const metadata: Metadata = {
	title: 'Implementing Rules and Regulations',
	description:
		'The operational rules that translate enacted Bangsamoro Autonomy Acts into practice.',
}

export default function IrrPage() {
	return <CategoryPage slug='irr' />
}
