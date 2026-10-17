import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CraftDialog } from '../../_components/craft-dialog'
import { CraftView } from '../../_components/craft-view'
import { craft, crafts } from '../../_lib/crafts'
import { pageMeta } from '../../_lib/seo'

export function generateStaticParams() {
	return crafts.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const c = craft((await params).slug)
	if (!c) return { title: 'Crafts', robots: { index: false, follow: true } }
	return pageMeta({ title: `${c.name} — Crafts`, description: c.summary, path: `/crafts/${c.slug}` })
}

/** A craft always opens as a full-screen dialog over the catalogue, whether clicked or linked to. */
export default async function CraftPage({ params }: { params: Promise<{ slug: string }> }) {
	const c = craft((await params).slug)
	if (!c) notFound()
	return (
		<CraftDialog slug={c.slug} name={c.name}>
			<CraftView c={c} />
		</CraftDialog>
	)
}
