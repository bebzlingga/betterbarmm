import { notFound } from 'next/navigation'
import { CraftDialog } from '../../../_components/craft-dialog'
import { CraftView } from '../../../_components/craft-view'
import { craft } from '../../../_lib/crafts'

/* A craft opened from the catalogue: the same view as its page, full screen
   over the catalogue. A reload or a shared link renders the page instead. */
export default async function CraftModal({ params }: { params: Promise<{ slug: string }> }) {
	const c = craft((await params).slug)
	if (!c) notFound()
	return (
		<CraftDialog slug={c.slug} name={c.name}>
			<CraftView c={c} dialog />
		</CraftDialog>
	)
}
