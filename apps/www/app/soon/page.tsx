import { ArrowRightIcon, EnvelopeSimpleIcon, FacebookLogoIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { Masthead, SectionHead } from '../_components/masthead'
import { WorkspaceIndex } from '../_components/workspace-index'
import { workspaces } from '../_lib/workspaces'
import { SiteHeader } from '../_components/site-header'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'Not open yet',
	description:
		'This workspace is still being compiled. What is already open, and where to look in the meantime.',
	path: '/soon',
	index: false,
})

/* ============================================================
   Not open yet

   The holding page for a workspace whose records are not ready to
   be read in public. It exists because the alternative is worse: a
   card that links to a subdomain mid-build hands a reader a broken
   or half-loaded room and says nothing about why.

   It says three things, in this order: this one is not ready, here
   is what is, and here is how to hear when it changes. What it does
   not do is apologise or promise a date — the registry's whole
   argument is that it says only what it can show.
   ============================================================ */


export default function SoonPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead
				brand
				label='Not open yet'
				lines={['This workspace is', 'still being compiled.']}
				headlineClassName='!text-[clamp(min(2.85rem,11vw),6vw,5.1rem)]'
				muted={[1]}
				standfirst='The records behind it are being read, checked and organized, and it opens when they are ready rather than when a date arrives. Nothing here is hidden — it is unfinished, which is a different thing, and this page exists to say which.'
			>
				<a href='#open' className='bb-btn bb-btn-solid'>
					See what is open
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</a>
				<Link href='/contribute' className='bb-btn bb-btn-ghost'>
					Contribute a source
				</Link>
			</Masthead>

			{/* ---- Open today, and coming later: the front page's own grid ---- */}
			<section id='open' className='bb-container scroll-mt-24 bb-section'>
				<SectionHead
					index='01'
					eyebrow='Open today'
					title='Start with'
					titleMuted='one of these.'
					lead='Every workspace that is open now. Each turns a pile of public records into something you can read, question, and trace back to the source.'
				/>
				<WorkspaceIndex workspaces={workspaces.filter((w) => w.state === 'live')} />
			</section>


			{/* ---- Hear when it opens ---- */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative flex flex-col gap-6 py-[clamp(3.75rem,7vw,6.5rem)] lg:flex-row lg:items-center lg:justify-between lg:gap-12'>
					<div className='max-w-[40rem]'>
						<h2 className='bb-display-sm text-[var(--ink)]'>Want to know when it opens?</h2>
						<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							New workspaces are announced on our Facebook page first. Or write to us, and tell us what you would most like to
							see in it.
						</p>
					</div>
					<div className='flex shrink-0 flex-wrap gap-3'>
						<a href='https://www.facebook.com/betterbarmm' target='_blank' rel='noreferrer' className='bb-btn bb-btn-solid'>
							<FacebookLogoIcon size={16} weight='fill' aria-hidden='true' />
							Follow on Facebook
						</a>
						<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-ghost'>
							<EnvelopeSimpleIcon size={16} aria-hidden='true' />
							Email us
						</a>
					</div>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
