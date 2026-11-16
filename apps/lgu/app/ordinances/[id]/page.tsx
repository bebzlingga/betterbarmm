import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PencilSimpleIcon, WarningIcon } from '@phosphor-icons/react/ssr'
import { ordinances, slug, type Ordinance } from '@betterbarmm/lgu-data/ordinances'
import { LguBreadcrumb, LguMasthead } from '../../_components/lgu-parts'
import { DocToc, type TocItem } from '../../_components/doc-toc'
import { VERDICT_MEANS, VerdictTag } from '../verdict'
import { OrdinanceActions } from './actions'

/* ============================================================
   One ordinance

   Read like a short brief: what it is, what BARMM can take from
   it, what it provides, and its penalties, in one column, with
   "On this page" and the facts beside it. The ordinance itself
   opens as a PDF in a dialog, from the site's own copy, and its
   text can be copied to start a draft from.
   ============================================================ */

export const dynamicParams = false

export function generateStaticParams() {
	return ordinances.map((o) => ({ id: o.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params
	const o = ordinances.find((one) => one.id === id)
	return o ? { title: `${o.shortTitle} — ${o.lgu}`, description: o.summary } : {}
}

const LEVEL: Record<string, string> = { province: 'Province', city: 'City', municipality: 'Municipality', barangay: 'Barangay' }
const LABEL = 'font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'
const H2 = 'text-[1.375rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'
const BODY = 'text-[1rem] leading-[1.8] text-[var(--ink-2)]'

function dated(date: string | null, year: number): string {
	if (!date) return String(year)
	return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/** BAA numbers link to the legislation workspace; BLGC sections to the Governance Code page. */
function lawHref(law: string): string | null {
	const baa = law.match(/BAA\s*(?:No\.)?\s*(\d+)/i)
	if (baa) return `https://legislation.betterbarmm.com/acts/${baa[1]}`
	if (/^BLGC/i.test(law)) return '/governance-code'
	return null
}

export default async function OrdinancePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const o = ordinances.find((one) => one.id === id)
	if (!o) notFound()

	const where = [o.lgu, o.province && o.province !== o.lgu ? o.province : null].filter(Boolean).join(', ')
	const cite = `${o.shortTitle}. ${o.number}, ${where}. Read from ${o.pdf} via BetterBARMM.`
	// The dock takes 600 letters; this stays well under.
	const question = `Explain ${o.lgu}'s ordinance "${o.shortTitle}" (${o.number}) in plain words: what it requires, who it covers and its penalties. What would a BARMM LGU change to adopt it under the Bangsamoro Local Governance Code?`.slice(0, 590)
	const actions = { id: o.id, title: `${o.shortTitle} · ${o.lgu}`, cite, question, source: o.pdf }

	const siblings = ordinances.filter((one) => one.category === o.category)
	const at = siblings.findIndex((one) => one.id === o.id)
	const prev = at > 0 ? siblings[at - 1] : null
	const next = at < siblings.length - 1 ? siblings[at + 1] : null

	const toc: TocItem[] = [
		{ id: 'in-brief', label: 'In brief', depth: 1 },
		...(o.barmm
			? ([
					{ id: 'for-barmm', label: 'What BARMM can take', depth: 1 },
					{ id: 'carry-over', label: 'Carry over', depth: 2 },
					{ id: 'change', label: 'Change for BARMM', depth: 2 },
				] as TocItem[])
			: []),
		{ id: 'provides', label: 'What it provides', depth: 1 },
		...(o.penalties || o.amends ? [{ id: 'penalties', label: o.penalties ? 'Penalties' : 'What it amends', depth: 1 } as TocItem] : []),
	]

	return (
		<>
			<LguMasthead
				breadcrumb={
					<LguBreadcrumb trail={[{ label: 'Ordinances', href: '/ordinances' }]}>
						{o.category}
					</LguBreadcrumb>
				}
				kicker={`${where} · ${o.year}`}
				name={o.shortTitle}
				note={o.number}
			>
				<div className='mt-8'>
					<OrdinanceActions {...actions} />
				</div>
			</LguMasthead>

			<div className='bb-container bb-section grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16'>
				{/* On a phone: the facts and the contents fold above the text. */}
				<details className='border border-[var(--rule)] bg-[var(--paper-2)] px-5 py-4 lg:hidden'>
					<summary className='cursor-pointer text-[0.875rem] font-semibold text-[var(--ink)]'>On this page, and the facts</summary>
					<ol className='mt-3'>
						{toc.map((item) => (
							<li key={item.id}>
								<a href={`#${item.id}`} className={`block py-1 text-[0.875rem] text-[var(--ink-2)] ${item.depth === 2 ? 'pl-4' : 'font-medium'}`}>
									{item.label}
								</a>
							</li>
						))}
					</ol>
					<Facts o={o} className='mt-5 border-t border-[var(--rule)] pt-4' />
				</details>

				<article className='min-w-0 max-w-[46rem]'>
					<section id='in-brief' className='scroll-mt-28'>
						<h2 className={H2}>In brief</h2>
						<p className={`mt-4 ${BODY} text-[1.0625rem]`}>{o.summary}</p>
						{o.caveat ? (
							<p className='mt-5 flex gap-3 border-l-2 border-[var(--brass)] bg-[var(--paper-2)] px-4 py-3 text-[0.875rem] leading-6 text-[var(--ink-2)]'>
								<WarningIcon size={18} aria-hidden='true' className='mt-0.5 shrink-0 text-[var(--brass)]' />
								<span>
									<span className='font-semibold text-[var(--ink)]'>Read with care. </span>
									{o.caveat}
								</span>
							</p>
						) : null}
					</section>

					{o.barmm ? <ForBarmm a={o.barmm} lgu={o.lgu} /> : null}

					<section id='provides' className='mt-14 scroll-mt-28'>
						<h2 className={H2}>What it provides</h2>
						<ol className='mt-5 grid gap-4'>
							{o.points.map((point, i) => (
								<li key={point} className={`flex gap-4 ${BODY}`}>
									<span className='num mt-[0.2rem] grid size-6 shrink-0 place-items-center bg-[var(--paper-3)] text-[0.75rem] font-bold text-[var(--ink-2)]'>{i + 1}</span>
									<span>{point}</span>
								</li>
							))}
						</ol>
					</section>

					{o.penalties || o.amends ? (
						<section id='penalties' className='mt-14 scroll-mt-28'>
							<h2 className={H2}>{o.penalties ? 'Penalties' : 'What it amends'}</h2>
							<dl className='mt-5 grid gap-5'>
								{o.penalties ? (
									<div>
										<dt className={LABEL}>If it is broken</dt>
										<dd className={`mt-1.5 ${BODY}`}>{o.penalties}</dd>
									</div>
								) : null}
								{o.amends ? (
									<div>
										<dt className={LABEL}>Amends or repeals</dt>
										<dd className={`mt-1.5 ${BODY}`}>{o.amends}</dd>
									</div>
								) : null}
							</dl>
						</section>
					) : null}

					<div className='mt-14 border-t border-[var(--rule)] pt-6'>
						<p className={LABEL}>Its full title</p>
						<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-3)]'>{o.title}</p>
					</div>

					{/* ---- On to the next one in the topic ---- */}
					<nav aria-label={`More on ${o.category.toLowerCase()}`} className='mt-10 grid gap-3 sm:grid-cols-2'>
						{prev ? <Step o={prev} dir='prev' /> : <span className='hidden sm:block' />}
						{next ? <Step o={next} dir='next' /> : null}
					</nav>
					<p className='mt-6 text-[0.875rem]'>
						<Link href={`/ordinances#${slug(o.category)}`} className='rule-link'>
							All {siblings.length} on {o.category.toLowerCase()}
						</Link>
					</p>
				</article>

				<aside className='hidden lg:block'>
					<div className='sticky top-[calc(var(--sticky-top)+2rem)] grid max-h-[calc(100vh-var(--sticky-top)-4rem)] gap-8 overflow-y-auto transition-[top] duration-300'>
						<DocToc items={toc} />
						<Facts o={o} className='border-t border-[var(--rule)] pt-6' />
						<OrdinanceActions {...actions} stacked />
					</div>
				</aside>
			</div>
		</>
	)
}

function Facts({ o, className = '' }: { o: Ordinance; className?: string }) {
	const rows: [string, React.ReactNode][] = [
		[LEVEL[o.level] ?? 'LGU', [o.lgu, o.province && o.province !== o.lgu ? o.province : null].filter(Boolean).join(', ')],
		['Region', o.region],
		['Enacted', o.enacted ? dated(o.enacted, o.year) : `${o.year}, date not legible`],
		['The PDF', `${o.pages} pages, ${o.read === 'ocr' ? 'a scan' : 'typed'}`],
		['Topic', <Link key='t' href={`/ordinances#${slug(o.category)}`} className='rule-link'>{o.category}</Link>],
	]
	return (
		<dl className={`grid gap-3.5 ${className}`}>
			{rows.map(([label, value]) => (
				<div key={label}>
					<dt className={LABEL}>{label}</dt>
					<dd className='mt-1 text-[0.84375rem] leading-5 text-[var(--ink-2)]'>{value}</dd>
				</div>
			))}
		</dl>
	)
}

function Step({ o, dir }: { o: Ordinance; dir: 'prev' | 'next' }) {
	return (
		<Link
			href={`/ordinances/${o.id}`}
			className={`group flex flex-col gap-1 border border-[var(--rule)] p-4 transition-colors hover:border-[var(--accent)] ${dir === 'next' ? 'sm:items-end sm:text-right' : ''}`}
		>
			<span className={`${LABEL} inline-flex items-center gap-1.5`}>
				{dir === 'prev' ? <ArrowLeftIcon size={11} weight='bold' aria-hidden='true' /> : null}
				{dir === 'prev' ? 'Previous' : 'Next'} in this topic
				{dir === 'next' ? <ArrowRightIcon size={11} weight='bold' aria-hidden='true' /> : null}
			</span>
			<span className='text-[0.9375rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{o.shortTitle}</span>
			<span className='text-[0.78125rem] text-[var(--ink-3)]'>
				{o.lgu} · {o.year}
			</span>
		</Link>
	)
}

/** What a BARMM LGU can take from it: the verdict, what carries over, what has to change and the law behind each. */
function ForBarmm({ a, lgu }: { a: NonNullable<Ordinance['barmm']>; lgu: string }) {
	return (
		<section id='for-barmm' className='mt-14 scroll-mt-28'>
			<h2 className={H2}>What BARMM can take from it</h2>
			<div className='mt-5 border border-[var(--rule)] bg-[var(--paper-2)] p-5 sm:p-6'>
				<VerdictTag verdict={a.verdict} />
				<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{VERDICT_MEANS[a.verdict]}</p>
				<p className='mt-3 text-[0.875rem] leading-6 text-[var(--ink-3)]'>
					<span className='font-semibold text-[var(--ink-2)]'>Suits </span>
					{a.fits.charAt(0).toLowerCase() + a.fits.slice(1)}
				</p>
			</div>
			<p className={`mt-6 ${BODY}`}>{a.why}</p>

			<h3 id='carry-over' className='mt-10 scroll-mt-28 text-[1.0625rem] font-extrabold text-[var(--ink)]'>
				Carry over
			</h3>
			<ul className='mt-4 grid gap-4'>
				{a.adopt.map((item) => (
					<li key={item} className={`flex gap-3 ${BODY}`}>
						<CheckIcon size={18} weight='bold' aria-hidden='true' className='mt-[0.3rem] shrink-0 text-[var(--accent)]' />
						<span>{item}</span>
					</li>
				))}
			</ul>

			<h3 id='change' className='mt-10 scroll-mt-28 text-[1.0625rem] font-extrabold text-[var(--ink)]'>
				Change for BARMM
			</h3>
			<ul className='mt-4 grid gap-4'>
				{a.change.map((item) => (
					<li key={item} className={`flex gap-3 ${BODY}`}>
						<PencilSimpleIcon size={18} aria-hidden='true' className='mt-[0.3rem] shrink-0 text-[var(--brass)]' />
						<span>{item}</span>
					</li>
				))}
			</ul>

			{a.laws.length > 0 ? (
				<div className='mt-8'>
					<p className={LABEL}>Read it with</p>
					<ul className='mt-3 flex flex-wrap gap-2'>
						{a.laws.map((law) => {
							const href = lawHref(law)
							const chip = 'inline-block rounded-full border border-[var(--rule)] px-3 py-1 text-[0.78125rem] font-medium text-[var(--ink-2)]'
							return (
								<li key={law}>
									{href ? (
										<a href={href} className={`${chip} transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]`}>
											{law}
										</a>
									) : (
										<span className={chip}>{law}</span>
									)}
								</li>
							)
						})}
					</ul>
				</div>
			) : null}

			<p className='mt-6 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
				{lgu}&rsquo;s ordinance has no force in BARMM; a council here drafts under the{' '}
				<Link href='/governance-code' className='rule-link'>
					Bangsamoro Local Governance Code
				</Link>
				.
			</p>
		</section>
	)
}
