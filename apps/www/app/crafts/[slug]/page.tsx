import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CraftView } from '../../_components/craft-view'
import { SiteHeader } from '../../_components/site-header'
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

export default async function CraftPage({ params }: { params: Promise<{ slug: string }> }) {
	const c = craft((await params).slug)
	if (!c) notFound()
	return (
		<main className='min-h-screen bg-[#f4efe8] text-[#3b2419]'>
			<SiteHeader activeItem='crafts' />
			<CraftView c={c} />
		</main>
	)
}
