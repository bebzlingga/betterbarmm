import type { Metadata } from 'next'
import Link from 'next/link'
import { GetInvolved } from '../../_components/get-involved'
import { Masthead } from '../../_components/masthead'
import { SiteHeader } from '../../_components/site-header'
import { datasets } from '../../_lib/open-data'
import { pageMeta } from '../../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Open data licence',
	description: 'How you may reuse BetterBARMM’s open data: CC BY 4.0 for most tables, the sources’ own terms for the rest, and how to credit it.',
	path: '/data/licence',
})

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 bb-body text-[var(--ink-2)]'
const A = 'font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'

function Under({ licence }: { licence: (l: string) => boolean }) {
	const list = datasets.filter((d) => licence(d.licence))
	return (
		<p className={P}>
			<span className='label mr-2'>Applies to</span>
			{list.map((d, i) => (
				<span key={d.slug}>
					<Link href={`/data/${d.slug}`} className={A}>
						{d.title}
					</Link>
					{i < list.length - 1 ? ', ' : ''}
				</span>
			))}
		</p>
	)
}

export default function LicencePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='data' />
			<Masthead brand label='Open data · Licence' lines={['Reuse it.', 'Say where it came from.']} muted={[1]} standfirst='Most tables here are yours to copy, change and publish, commercially or not, as long as you credit BetterBARMM. Two follow their sources’ terms instead.' />

			<div className='bb-container bb-section'>
				<div className='max-w-[52rem] [&>section+section]:mt-14'>
				<section id='cc-by' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<h2 className={H2}>CC BY 4.0</h2>
					<p className={P}>
						BetterBARMM releases its tables under the{' '}
						<a href='https://creativecommons.org/licenses/by/4.0/' target='_blank' rel='noreferrer' className={A}>
							Creative Commons Attribution 4.0 International licence
						</a>
						. You may share and adapt them for any purpose, including commercial work, provided you give credit, link to the
						licence, and say if you changed anything.
					</p>
					<p className={P}>Credit it like this:</p>
					<p className='mt-3 border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-5 py-4 font-mono text-[0.8125rem] leading-6 text-[var(--ink)]'>
						Source: BetterBARMM, “Local governments” (betterbarmm.com/data), CC BY 4.0.
					</p>
					<p className={P}>
						The records underneath are the government’s. No copyright subsists in a work of the Government of the Philippines
						(Republic Act 8293, Sec. 176), though the law asks for the office’s approval before such a work is exploited for
						profit. What the licence covers is BetterBARMM’s own work on them: reading them, putting them in tables and
						describing every column.
					</p>
					<Under licence={(l) => l.startsWith('CC BY')} />
				</section>

				<section id='odbl' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<h2 className={H2}>ODbL 1.0</h2>
					<p className={P}>
						The hazard exposure tables are built from Project NOAH’s hazard maps and OpenStreetMap, both shared under the{' '}
						<a href='https://opendatacommons.org/licenses/odbl/1-0/' target='_blank' rel='noreferrer' className={A}>
							Open Database License
						</a>
						, so they are shared under it too. Credit Project NOAH, OpenStreetMap contributors and BetterBARMM, and a
						database you publish built on them must be shared under the ODbL as well.
					</p>
					<Under licence={(l) => l.startsWith('ODbL')} />
				</section>

				<section id='facts' className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<h2 className={H2}>Facts only</h2>
					<p className={P}>
						The news table lists where a story is: the outlet, the date, the headline and the link. The stories are the outlets’
						and stay theirs; their teasers are left out for that reason. Link to the story rather than copying it.
					</p>
					<Under licence={(l) => l === 'Facts only'} />
				</section>

				<section>
					<h2 className={H2}>No warranty</h2>
					<p className={P}>
						The tables are given as they are. Each says where its records come from and what they cannot tell you; check a
						figure against its source before you rest a decision on it. If you find a mistake,{' '}
						<a href='https://betterbarmm.com/contribute' className={A}>
							tell us
						</a>{' '}
						and it will be corrected for everyone.
					</p>
					<p className={P}>The code that builds this site is a separate matter, released under the GNU General Public License v3.</p>
				</section>
				</div>
			</div>

			<GetInvolved />
		</main>
	)
}
