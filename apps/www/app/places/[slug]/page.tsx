import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OverlayDialog } from '../../_components/overlay-dialog'
import { PlaceView } from '../../_components/place-view'
import { place, places } from '../../_lib/places'
import { pageMeta } from '../../_lib/seo'

export function generateStaticParams() {
	return places.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const p = place((await params).slug)
	if (!p) return { title: 'Places', robots: { index: false, follow: true } }
	return pageMeta({ title: `${p.name} — Places`, description: p.summary, path: `/places/${p.slug}` })
}

/** A place always opens as a full-screen dialog over the catalogue, whether clicked or linked to. */
export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
	const p = place((await params).slug)
	if (!p) notFound()
	return (
		<OverlayDialog
			id={p.slug}
			name={p.name}
			home='/places'
			className='bg-[#f6f9f8] text-[#13303a] backdrop:bg-black/70'
			// On a small white disc, readable over the photograph and the page alike.
			closeClassName='rounded-full bg-white/95 text-[#13303a] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)]'
		>
			<PlaceView p={p} />
		</OverlayDialog>
	)
}
