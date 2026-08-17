import type { Metadata } from 'next'
import { CategoryPage } from '../_components/category-page'

export const metadata: Metadata = {
	title: 'Resolutions',
	description:
		'Every resolution of the Bangsamoro Parliament — adopted and still pending — with authors, sitting, and the history behind each one.',
}

export default function ResolutionsPage() {
	return <CategoryPage slug='resolutions' />
}
