import fs from 'node:fs'
import { Hero } from '../../_components/hero'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BankIcon,
	CalendarBlankIcon,
	CalendarCheckIcon,
	CoinsIcon,
	FilePdfIcon,
	LightbulbIcon,
	ListNumbersIcon,
	MapPinIcon,
	PencilSimpleIcon,
	PenNibIcon,
	PlusCircleIcon,
	ScrollIcon,
	SealCheckIcon,
	ShieldCheckIcon,
	TagIcon,
	UsersThreeIcon,
	WarningIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
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
		{ id: 'at-a-glance', label: 'At a glance', depth: 1 },
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
			{/* ---- The crimson header (user decision: the travel look): the title and what to do with it on the left, the
			     ordinance as a document on the right ---- */}
			<Hero
				above={<LguBreadcrumb trail={[{ label: 'Ordinances', href: '/ordinances' }]}>{o.category}</LguBreadcrumb>}
				kicker={`${LEVEL[o.level] ?? 'LGU'} · ${where} · ${o.year}`}
				title={o.shortTitle}
				small
				lede={o.number}
				side={
					<div className='mx-auto w-full max-w-[17rem] lg:mr-0'>
						<Sheet o={o} where={where} />
					</div>
				}
			>
				<div className='mt-8'>
					<OrdinanceActions {...actions} />
				</div>
			</Hero>
			{o.highlights?.length ? <Highlights items={o.highlights} /> : null}

			<div className='bb-container bb-section grid gap-10 !pt-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16 lg:!pt-12'>
				{/* On a phone: the facts and the contents fold above the text. */}
				<details className='rounded-[var(--dv-r)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--paper))] px-6 py-4 lg:hidden'>
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
							<div className='mt-6 flex gap-3.5 border-t border-[var(--rule-soft)] pt-5'>
								<WarningIcon size={22} weight='duotone' aria-hidden='true' className='mt-0.5 shrink-0 text-[#b0841c]' />
								<p className='text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>
									<span className='font-semibold text-[var(--ink)]'>Read with care. </span>
									{o.caveat}
								</p>
							</div>
						) : null}
					</section>

					<section id='at-a-glance' className='mt-16 scroll-mt-28'>
						<h2 className={H2}>At a glance</h2>
						<Facts o={o} className='mt-5' />
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
					<div className='sticky top-[calc(var(--sticky-top)+2rem)] grid max-h-[calc(100vh-var(--sticky-top)-4rem)] gap-8 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-[top] duration-300'>
						<DocToc items={toc} />
					</div>
				</aside>
			</div>

			{/* ---- On through the topic: its own section, one row, the previous on the left and the next on the right ---- */}
			<section className='bb-container pb-[clamp(4rem,7vw,6rem)]'>
				<nav aria-label={`More on ${o.category.toLowerCase()}`} className='grid gap-4 sm:grid-cols-2'>
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
		<div className='bb-container pt-12 lg:pt-16'>
			<ul aria-label='Highlights' className={`grid gap-3 sm:grid-cols-2 ${cols}`}>
				{items.map((h, i) => (
					<li
						key={h.label}
						className='flex min-w-0 flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] lg:p-7'
					>
						<span className='text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>Highlight {String(i + 1).padStart(2, '0')}</span>
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
	// The particulars as a list in the reading column (user decision: a list, not a card): each fact a row, its icon and
	// label on the left, the value on the right, a soft rule between rows. Names and the bodies it creates are lists,
	// so they read as chips; the rest are sentences, each shown only where the text says it.
	const d = o.details
	const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)
	const rows: [string, React.ReactNode | string[] | null][] = [
		['The ordinance', <span key='n' className='font-semibold text-[var(--ink)]'>{o.number}</span>],
		['Passed by', `${LEVEL[o.level] ?? 'LGU'} of ${[o.lgu, o.province && o.province !== o.lgu ? o.province : null].filter(Boolean).join(', ')}`],
		['Region', o.region],
		['Enacted', o.enacted ? dated(o.enacted, o.year) : `${o.year}, day not legible`],
		['The PDF', `${o.pages} pages, ${o.read === 'ocr' ? 'a scan' : 'typed'}`],
		['Topic', <Link key='t' href={`/ordinances#${slug(o.category)}`} className='rule-link'>{o.category}</Link>],
		['For your LGU', o.barmm ? <VerdictTag key='v' verdict={o.barmm.verdict} /> : null],
		...((d
			? [
					['Authored by', d.sponsors.length ? d.sponsors : null],
					['Approved by', d.approvedBy ? `${d.approvedBy}${d.approved ? `, ${dated(d.approved, o.year)}` : ''}` : null],
					['Takes effect', d.effect ? cap(d.effect) : null],
					['Length', d.structure ? cap(d.structure) : null],
					['Covers', d.covers ? cap(d.covers) : null],
					['Enforced by', d.enforcers ? cap(d.enforcers) : null],
					['Paid for by', d.funding ? cap(d.funding) : null],
					['Creates', d.creates.length ? d.creates : null],
				]
			: []) as [string, React.ReactNode | string[] | null][]),
	]
	const CHIP = 'rounded-full px-3 py-1 text-[0.8125rem] leading-5 text-[var(--ink-2)] ring-1 ring-inset ring-[var(--rule)]'
	const chips = (list: string[]) => (
		<ul className='flex flex-wrap gap-1.5'>
			{list.slice(0, 6).map((v) => (
				<li key={v} className={CHIP}>{v}</li>
			))}
			{list.length > 6 ? (
				<li>
					<details className='group'>
						<summary className={`${CHIP} cursor-pointer list-none font-semibold text-[var(--accent)] group-open:hidden [&::-webkit-details-marker]:hidden`}>+{list.length - 6} more</summary>
						<ul className='flex flex-wrap gap-1.5'>
							{list.slice(6).map((v) => (
								<li key={v} className={CHIP}>{v}</li>
							))}
						</ul>
					</details>
				</li>
			) : null}
		</ul>
	)
	return (
		<dl className={`border-t border-[var(--rule)] ${className}`}>
			{rows
				.filter(([, value]) => value != null)
				.map(([label, value]) => {
					const Glyph = FACT_ICON[label]
					return (
						<div key={label} className='grid gap-x-8 gap-y-1.5 border-b border-[var(--rule-soft)] py-4 sm:grid-cols-[13rem_minmax(0,1fr)]'>
							<dt className='flex items-center gap-2.5 text-[0.875rem] font-semibold text-[var(--ink-3)]'>
								{Glyph ? <Glyph size={18} weight='duotone' aria-hidden='true' className='shrink-0 text-[var(--accent)]' /> : null}
								{label}
							</dt>
							<dd className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{Array.isArray(value) ? chips(value as string[]) : value}</dd>
						</div>
					)
				})}
		</dl>
	)
}

/** A small picture for each fact's label. */
const FACT_ICON: Record<string, Icon> = {
	'The ordinance': ScrollIcon,
	'Passed by': BankIcon,
	Region: MapPinIcon,
	Enacted: CalendarBlankIcon,
	'The PDF': FilePdfIcon,
	Topic: TagIcon,
	'For your LGU': LightbulbIcon,
	'Authored by': PenNibIcon,
	'Approved by': SealCheckIcon,
	'Takes effect': CalendarCheckIcon,
	Length: ListNumbersIcon,
	Covers: UsersThreeIcon,
	'Enforced by': ShieldCheckIcon,
	'Paid for by': CoinsIcon,
	Creates: PlusCircleIcon,
}

function Step({ o, dir }: { o: Ordinance; dir: 'prev' | 'next' }) {
	const Arrow = dir === 'prev' ? ArrowLeftIcon : ArrowRightIcon
	return (
		<Link
			href={`/ordinances/${o.id}`}
			className={`group flex min-w-0 items-center gap-5 rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)] sm:p-7 ${dir === 'next' ? 'flex-row-reverse text-right' : ''}`}
		>
			<span className='grid size-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white'>
				<Arrow size={18} weight='bold' aria-hidden='true' />
			</span>
			<span className='min-w-0'>
				<span className='block font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{dir === 'prev' ? 'Previous' : 'Next'} in {o.category.toLowerCase()}</span>
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
			className={`flex min-w-0 items-center rounded-[var(--dv-r)] border border-dashed border-[var(--rule)] p-6 text-[0.875rem] text-[var(--ink-3)] transition-colors hover:text-[var(--accent)] sm:p-7 ${dir === 'next' ? 'justify-end text-right' : ''}`}
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

				<div className='mt-6 grid gap-5 rounded-[var(--dv-r)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--paper))] p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8'>
					<div>
						<VerdictTag verdict={a.verdict} />
						<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{VERDICT_MEANS[a.verdict]}</p>
					</div>
					<div className='rounded-2xl bg-[var(--paper)] p-5 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.4)]'>
						<p className='flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>
							<UsersThreeIcon size={14} weight='duotone' aria-hidden='true' />
							May suit
						</p>
						<p className='mt-2 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{a.fits}</p>
					</div>
				</div>
				<p className={`mt-6 ${BODY}`}>{a.why}</p>

				{a.apply?.length ? (
					<div className='mt-10'>
						{/* A table in all but markup: the condition to check against your LGU, then what to do if it holds. */}
						<div className={`${STEP_COLS} hidden border-b border-[var(--rule)] pb-2 md:grid`} aria-hidden='true'>
							<span />
							<span className={LABEL}>If this is your LGU</span>
							<span className={LABEL}>What to do</span>
						</div>
						<ol className='border-t border-[var(--rule)] md:border-t-0'>
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
