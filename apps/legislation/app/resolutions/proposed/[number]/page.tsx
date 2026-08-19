import type { Metadata } from 'next'
import { RecordPage, recordMetadata } from '../../../_components/record-page'
import { getRecordNumbers } from '../../../_lib/legislation-data'

export const dynamicParams = false

export function generateStaticParams() {
	return getRecordNumbers('proposed-resolutions').map((number) => ({ number: String(number) }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ number: string }>
}): Promise<Metadata> {
	const { number } = await params
	return recordMetadata('proposed-resolutions', number)
}

/** One proposed resolution. */
export default async function Page({ params }: { params: Promise<{ number: string }> }) {
	const { number } = await params

	return <RecordPage category='proposed-resolutions' number={number} />
}
