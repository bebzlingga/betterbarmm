import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ArrowRightIcon, PencilSimpleIcon, WarningIcon } from '@phosphor-icons/react/ssr'
import { ordinances, slug, type Ordinance } from '@betterbarmm/lgu-data/ordinances'
import { LguBreadcrumb } from '../../_components/lgu-parts'
import { DocToc, type TocItem } from '../../_components/doc-toc'
import { VERDICT_MEANS, VerdictTag } from '../verdict'
import { OrdinanceActions } from './actions'

/* ============================================================
   One ordinance

   Its highlights in the band, as figures. Then a short brief: what
   it is and what it provides, how a BARMM LGU could use it (written
   as conditions the reader checks against their own LGU: "if you
   have this, you can replicate it by…"), what must be rewritten
   under the Bangsamoro Local Governance Code, and its penalties.
   Its particulars run in one row above the brief, "On this page" beside the text. The ordinance itself
   opens as a PDF in a dialog, from the site's own copy.
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
const H2 = 'text-[1.625rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'
const LEAD = 'mt-2 text-[0.9375rem] leading-7 text-[var(--ink-3)]'
/** The steps' columns: the index, the condition, what to do. */
const STEP_COLS = 'md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,3fr)] md:gap-x-8'
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
	// The dock takes 600 letters; this stays well under.
	const question = `Explain ${o.lgu}'s ordinance "${o.shortTitle}" (${o.number}) in plain words: what it requires, who it covers and its penalties. What would a BARMM LGU change to adopt it under the Bangsamoro Local Governance Code?`.slice(0, 590)
	// The site's own copy when it has one (publish_pdfs.py), else the LGU's or the Internet Archive's, opened in a new tab.
	const hosted = fs.existsSync(path.join(process.cwd(), 'public', 'ordinances', `${o.id}.pdf`))
	const actions = { id: o.id, title: `${o.shortTitle} · ${o.lgu}`, question, source: o.pdf, elsewhere: hosted ? null : (o.archived ?? o.pdf) }

	const siblings = ordinances.filter((one) => one.category === o.category)
	const at = siblings.findIndex((one) => one.id === o.id)
	const prev = at > 0 ? siblings[at - 1] : null
	const next = at < siblings.length - 1 ? siblings[at + 1] : null

	const toc: TocItem[] = [
		{ id: 'in-brief', label: 'In brief', depth: 1 },
		{ id: 'provides', label: 'What it provides', depth: 1 },
		...(o.barmm
			? ([
					{ id: 'your-lgu', label: 'Using it in your LGU', depth: 1 },
					{ id: 'rewrite', label: 'What to rewrite', depth: 1 },
				] as TocItem[])
			: []),
		...(o.penalties || o.amends ? [{ id: 'penalties', label: o.penalties ? 'Penalties' : 'What it amends', depth: 1 } as TocItem] : []),
	]

	return (
		<>
			{/* ---- The band: the title and what to do with it on the left, the ordinance as a document on the right ---- */}
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -left-[16rem] -top-[22rem] h-[40rem] w-[64rem] max-w-[160vw] bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className={`bb-container relative pt-14 lg:pt-20 ${o.highlights?.length ? 'pb-28 lg:pb-32' : 'pb-16 lg:pb-20'}`}>
					<LguBreadcrumb trail={[{ label: 'Ordinances', href: '/ordinances' }]}>{o.category}</LguBreadcrumb>
					<div className='mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center lg:gap-28'>
						<div className='min-w-0'>
							<span className='bb-label'>{`${LEVEL[o.level] ?? 'LGU'} · ${where} · ${o.year}`}</span>
							<h1 className='mt-4 text-[clamp(2rem,3.6vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-[var(--ink)] [font-family:var(--font-display)]'>{o.shortTitle}</h1>
							<p className='mt-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{o.number}</p>
							<div className='mt-8'>
								<OrdinanceActions {...actions} />
							</div>
						</div>
						<Sheet o={o} where={where} />
					</div>
				</div>
			</section>
			{o.highlights?.length ? <Highlights items={o.highlights} /> : null}

			<div className='bb-container bb-section grid gap-10 !pt-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16 lg:!pt-12'>
				{/* The particulars, one row across the page above the brief. */}
				<Facts o={o} className='lg:col-span-2' />

				{/* On a phone: the facts and the contents fold above the text. */}
				<details className='border border-[var(--rule)] bg-[var(--paper-2)] px-5 py-4 lg:hidden'>
					<summary className='cursor-pointer text-[0.875rem] font-semibold text-[var(--ink)]'>On this page</summary>
					<ol className='mt-3'>
						{toc.map((item) => (
							<li key={item.id}>
								<a href={`#${item.id}`} className='block py-1 text-[0.875rem] font-medium text-[var(--ink-2)]'>
									{item.label}
								</a>
							</li>
						))}
					</ol>
				</details>

				<article className='min-w-0 max-w-[60rem]'>
					<section id='in-brief' className='scroll-mt-28'>
						<h2 className={H2}>In brief</h2>
						<p className='mt-4 text-[1rem] leading-[1.8] text-[var(--ink)]'>{o.summary}</p>
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

					<section id='provides' className='mt-16 scroll-mt-28'>
						<h2 className={H2}>What it provides</h2>
						<p className={LEAD}>As {o.lgu} wrote it{o.provisions?.length ? ', provision by provision, with where each is in the text.' : ', in brief.'}</p>
						{o.provisions?.length ? (
							<ol className='mt-6 border-t border-[var(--rule)]'>
								{o.provisions.map((p, i) => (
									<li key={p.title} className='grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-[var(--rule-soft)] py-5 sm:grid-cols-[2rem_minmax(0,1fr)_7rem]'>
										<span className='num pt-0.5 font-mono text-[0.75rem] font-bold text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
										<div className='min-w-0'>
											<h3 className='text-[1rem] font-bold leading-snug text-[var(--ink)]'>{p.title}</h3>
											<p className='mt-1.5 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{p.text}</p>
										</div>
										{p.section ? <span className={`${LABEL} col-start-2 pt-1 sm:col-start-3 sm:text-right`}>{p.section}</span> : null}
									</li>
								))}
							</ol>
						) : (
							<ol className='mt-6 border-t border-[var(--rule)]'>
								{o.points.map((point, i) => (
									<li key={point} className='flex gap-4 border-b border-[var(--rule-soft)] py-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
										<span className='num w-6 shrink-0 pt-px font-mono text-[0.75rem] font-bold text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
										<span>{point}</span>
									</li>
								))}
							</ol>
						)}
					</section>

					{o.barmm ? <YourLgu a={o.barmm} lgu={o.lgu} /> : null}

					{o.penalties || o.amends ? (
						<section id='penalties' className='mt-16 scroll-mt-28'>
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

					<div className='mt-16 border-t border-[var(--rule)] pt-6'>
						<p className={LABEL}>Its full title</p>
						<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-3)]'>{o.title}</p>
					</div>

				</article>

				<aside className='hidden lg:block'>
					<div className='sticky top-[calc(var(--sticky-top)+2rem)] grid max-h-[calc(100vh-var(--sticky-top)-4rem)] gap-8 overflow-y-auto transition-[top] duration-300'>
						<DocToc items={toc} />
					</div>
				</aside>
			</div>

			{/* ---- On through the topic: its own section, one row, the previous on the left and the next on the right ---- */}
			<section className='border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<nav aria-label={`More on ${o.category.toLowerCase()}`} className='bb-container grid sm:grid-cols-2'>
					{prev ? <Step o={prev} dir='prev' /> : <Edge dir='prev' topic={o.category} />}
					{next ? <Step o={next} dir='next' /> : <Edge dir='next' topic={o.category} />}
				</nav>
			</section>
		</>
	)
}

/** The ordinance's standout facts across the band's lower edge: one hairline panel split into figures, as the
    workspace's figure rows are, each with its index in brass, the figure in crimson and what it counts under it. */
function Highlights({ items }: { items: NonNullable<Ordinance['highlights']> }) {
	const cols = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'][Math.min(items.length, 4)]
	return (
		<div className='bb-container relative z-10 -mt-16 lg:-mt-20'>
			<ul aria-label='Highlights' className={`grid border border-[var(--rule)] bg-[var(--paper)] sm:grid-cols-2 ${cols}`}>
				{items.map((h, i) => (
					<li
						key={h.label}
						className={`flex min-w-0 flex-col px-6 py-6 lg:px-7 ${i ? 'border-t border-[var(--rule)] sm:border-t-0' : ''} ${i % 2 ? 'sm:border-l sm:border-[var(--rule)]' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i ? 'lg:border-l lg:border-[var(--rule)]' : ''}`}
					>
						<span className='font-mono text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-[var(--brass)]'>Highlight {String(i + 1).padStart(2, '0')}</span>
						<span className='num mt-3 text-[clamp(1.75rem,2.6vw,2.375rem)] font-extrabold leading-none tracking-[-0.045em] text-[var(--accent)] [font-family:var(--font-display)]'>{h.value}</span>
						<span className='mt-3 text-[0.875rem] leading-snug text-[var(--ink-2)]'>{h.label}</span>
					</li>
				))}
			</ul>
		</div>
	)
}

/** The ordinance drawn as the paper it is: who passed it, its number, when, how long and what about. */
function Sheet({ o, where }: { o: Ordinance; where: string }) {
	const rows: [string, string][] = [
		['Enacted', o.enacted ? dated(o.enacted, o.year) : String(o.year)],
		['Length', `${o.pages} pages, ${o.read === 'ocr' ? 'a scan' : 'typed'}`],
		['Topic', o.category],
	]
	return (
		<div aria-hidden='true' className='relative hidden rotate-[1.5deg] bg-[#fbf8f1] p-6 text-[#2a2520] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)] [clip-path:polygon(0_0,calc(100%-2rem)_0,100%_2rem,100%_100%,0_100%)] lg:block'>
			<span className='absolute right-0 top-0 size-8 bg-[#e6dfd0] [clip-path:polygon(0_0,100%_100%,0_100%)]' />
			<p className='text-center font-mono text-[0.5625rem] font-bold uppercase tracking-[0.18em] text-[#8a7a5c]'>{LEVEL[o.level] ?? 'LGU'} of {where}</p>
			<p className='mt-1 text-center font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-[#8a7a5c]'>Office of the Sanggunian</p>
			<p className='mt-5 text-center text-[1.375rem] font-black uppercase tracking-[0.12em] [font-family:var(--font-display)]'>Ordinance</p>
			<p className='mt-1 text-center text-[0.8125rem] leading-snug text-[#5a5248]'>{o.number}</p>
			<div className='mt-5 space-y-1.5' aria-hidden='true'>
				{[100, 92, 96, 70].map((w) => (
					<span key={w} className='block h-[3px] bg-[#e3dccd]' style={{ width: `${w}%` }} />
				))}
			</div>
			<dl className='mt-5 grid gap-2 border-t border-[#e3dccd] pt-4 text-[0.75rem]'>
				{rows.map(([k, v]) => (
					<div key={k} className='flex justify-between gap-4'>
						<dt className='text-[#8a7a5c]'>{k}</dt>
						<dd className='text-right font-semibold'>{v}</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

/** The ordinance's particulars as one row across the page: its number, who passed it, where, when, how long, the
    topic and the verdict, each label over value with a hairline between. The button that opens it is in the band. */
function Facts({ o, className = '' }: { o: Ordinance; className?: string }) {
	const cells: [string, React.ReactNode][] = [
		['The ordinance', <span key='n' className='font-bold text-[var(--ink)]'>{o.number}</span>],
		['Passed by', `${LEVEL[o.level] ?? 'LGU'} of ${[o.lgu, o.province && o.province !== o.lgu ? o.province : null].filter(Boolean).join(', ')}`],
		['Region', o.region],
		['Enacted', o.enacted ? dated(o.enacted, o.year) : `${o.year}, day not legible`],
		['The PDF', `${o.pages} pages, ${o.read === 'ocr' ? 'a scan' : 'typed'}`],
		['Topic', <Link key='t' href={`/ordinances#${slug(o.category)}`} className='rule-link'>{o.category}</Link>],
		...(o.barmm ? ([['For your LGU', <VerdictTag key='v' verdict={o.barmm.verdict} />]] as [string, React.ReactNode][]) : []),
	]
	// The second row: what the text says about itself, each shown only where it says it.
	const d = o.details
	const rows: [string, string | null][] = d
		? [
				['Authored by', d.sponsors.length ? d.sponsors.join(', ') : null],
				['Approved by', d.approvedBy ? `${d.approvedBy}${d.approved ? `, ${dated(d.approved, o.year)}` : ''}` : null],
				['Takes effect', d.effect],
				['Length', d.structure],
				['Covers', d.covers],
				['Enforced by', d.enforcers],
				['Paid for by', d.funding],
				['Creates', d.creates.length ? d.creates.join('; ') : null],
			]
		: []
	const more = rows.flatMap(([k, v]) => (v ? [[k, v.charAt(0).toUpperCase() + v.slice(1)] as const] : []))
	return (
		<div className={`border border-[var(--rule)] bg-[var(--paper)] ${className}`}>
			<dl className='grid grid-cols-2 sm:grid-cols-4 xl:flex'>
				{cells.map(([label, value]) => (
					<div key={label} className='min-w-0 border-b border-r border-[var(--rule-soft)] px-5 py-4 xl:flex-auto xl:border-b-0 xl:last:border-r-0'>
						<dt className={LABEL}>{label}</dt>
						<dd className='mt-1.5 text-[0.84375rem] leading-5 text-[var(--ink-2)]'>{value}</dd>
					</div>
				))}
			</dl>
			{more.length ? (
				<dl className='grid border-t border-[var(--rule)] bg-[var(--paper-2)] sm:grid-cols-2 xl:grid-cols-4'>
					{more.map(([label, value]) => (
						<div key={label} className='min-w-0 border-b border-r border-[var(--rule-soft)] px-5 py-4'>
							<dt className={LABEL}>{label}</dt>
							<dd className='mt-1.5 text-[0.84375rem] leading-5 text-[var(--ink-2)]'>{value}</dd>
						</div>
					))}
				</dl>
			) : null}
		</div>
	)
}

function Step({ o, dir }: { o: Ordinance; dir: 'prev' | 'next' }) {
	const Arrow = dir === 'prev' ? ArrowLeftIcon : ArrowRightIcon
	return (
		<Link
			href={`/ordinances/${o.id}`}
			className={`group flex min-w-0 items-center gap-5 py-10 transition-colors hover:text-[var(--accent)] ${dir === 'next' ? 'flex-row-reverse border-t border-[var(--rule)] text-right sm:border-l sm:border-t-0 sm:pl-10' : 'sm:pr-10'}`}
		>
			<Arrow size={22} weight='bold' aria-hidden='true' className={`shrink-0 text-[var(--ink-3)] transition group-hover:text-[var(--accent)] ${dir === 'next' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
			<span className='min-w-0'>
				<span className={`${LABEL} block`}>{dir === 'prev' ? 'Previous' : 'Next'} in {o.category.toLowerCase()}</span>
				<span className='mt-1.5 line-clamp-2 block text-[1.125rem] font-extrabold leading-snug tracking-[-0.015em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{o.shortTitle}</span>
				<span className='mt-1 block text-[0.8125rem] text-[var(--ink-3)]'>
					{o.lgu} · {o.year}
				</span>
			</span>
		</Link>
	)
}

/** The end of the topic on one side: a line back to the whole topic, so the row keeps its two halves. */
function Edge({ dir, topic }: { dir: 'prev' | 'next'; topic: string }) {
	return (
		<Link
			href={`/ordinances#${slug(topic)}`}
			className={`flex min-w-0 items-center py-10 text-[0.875rem] text-[var(--ink-3)] transition-colors hover:text-[var(--accent)] ${dir === 'next' ? 'justify-end border-t border-[var(--rule)] text-right sm:border-l sm:border-t-0 sm:pl-10' : 'sm:pr-10'}`}
		>
			{dir === 'prev' ? 'The first' : 'The last'} in {topic.toLowerCase()}. See them all
		</Link>
	)
}

/** How a BARMM LGU could use it: the verdict, then "if you have this, you can replicate it by…", then the rewrites the
    Governance Code asks for and the law behind each. Nothing here assumes what a given LGU has. */
function YourLgu({ a, lgu }: { a: NonNullable<Ordinance['barmm']>; lgu: string }) {
	return (
		<>
			<section id='your-lgu' className='mt-16 scroll-mt-28'>
				<h2 className={H2}>Using it in your LGU</h2>
				<p className={LEAD}>Whether it fits depends on what your LGU already has. Check each condition against your own.</p>

				<div className='mt-6 grid gap-5 border border-[var(--rule)] bg-[var(--paper-2)] p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8'>
					<div>
						<VerdictTag verdict={a.verdict} />
						<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{VERDICT_MEANS[a.verdict]}</p>
					</div>
					<div className='border-t border-[var(--rule)] pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0'>
						<p className={LABEL}>May suit</p>
						<p className='mt-2 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{a.fits}</p>
					</div>
				</div>
				<p className={`mt-6 ${BODY}`}>{a.why}</p>

				{a.apply?.length ? (
					<div className='mt-10'>
						{/* A table in all but markup: the condition to check against your LGU, then what to do if it holds. */}
						<div className={`${STEP_COLS} hidden border-b border-[var(--ink)] pb-2 md:grid`} aria-hidden='true'>
							<span />
							<span className={LABEL}>If this is your LGU</span>
							<span className={LABEL}>What to do</span>
						</div>
						<ol className='border-t border-[var(--ink)] md:border-t-0'>
							{a.apply.map((step, i) => (
								<li key={step.if} className={`${STEP_COLS} grid gap-y-2 border-b border-[var(--rule)] py-5`}>
									<span className='num pt-0.5 font-mono text-[0.75rem] font-bold text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
									<p className='text-[0.9375rem] font-semibold leading-7 text-[var(--ink)]'>{step.if.replace(/[,.\s]+$/, '')}</p>
									<p className='flex gap-2.5 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
										<ArrowRightIcon size={14} weight='bold' aria-hidden='true' className='mt-[0.4rem] shrink-0 text-[var(--accent)]' />
										<span>{step.then.charAt(0).toUpperCase() + step.then.slice(1)}</span>
									</p>
								</li>
							))}
						</ol>
					</div>
				) : null}
			</section>

			<section id='rewrite' className='mt-16 scroll-mt-28'>
				<h2 className={H2}>What to rewrite</h2>
				<p className={LEAD}>{lgu} drafted under the 1991 Local Government Code. A BARMM council drafts under the Bangsamoro Local Governance Code, so these parts change whatever your LGU has.</p>
				<ul className='mt-6 grid gap-4'>
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
		</>
	)
}
