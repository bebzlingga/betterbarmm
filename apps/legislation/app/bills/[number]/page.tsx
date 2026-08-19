import type { Metadata } from 'next'
import { RecordPage, recordMetadata } from '../../_components/record-page'
import { getRecordNumbers } from '../../_lib/legislation-data'

export const dynamicParams = false

export function generateStaticParams() {
	return getRecordNumbers('bills').map((number) => ({ number: String(number) }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ number: string }>
}): Promise<Metadata> {
	const { number } = await params
	return recordMetadata('bills', number)
}

/** One bill. */
export default async function Page({ params }: { params: Promise<{ number: string }> }) {
	const { number } = await params

	return <RecordPage category='bills' number={number} />
}
