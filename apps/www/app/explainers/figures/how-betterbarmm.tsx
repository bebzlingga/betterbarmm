import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   Graphics for "How BetterBARMM brings the records together"

   Plain HTML on the site's tokens, as the CADENA graphics are, so they
   read in both themes and print.
   ============================================================ */

const FIG = 'bb-graphic my-10 leading-[1.7] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'
const CAPTION = 'mt-5 text-[0.78125rem] leading-[1.7] text-[var(--ink-3)]'
const KICKER = 'text-[0.65625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'

/* ---- 1. The six steps ---- */

const STEPS = [
	{ what: 'Collect', detail: 'Fetch the page or document, and keep where and when it was read.' },
	{ what: 'Read', detail: 'Take its text; read scanned pages with OCR and check them against the scan.' },
	{ what: 'Extract', detail: 'Pull it into named fields. What the source doesn’t say stays empty.' },
	{ what: 'Match', detail: 'Tie every spelling to one office, town or barangay, by its standard code.' },
	{ what: 'Check', detail: 'Compare with other records: newer dated sources win, disagreements are noted.' },
	{ what: 'Publish', detail: 'Put it up with its source and its date beside it.' },
]

export function Pipeline() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>From a page to a record</p>
			<p className='mt-2 text-[0.9375rem] font-bold leading-snug text-[var(--ink)]'>Every record passes through the same six steps.</p>
			<ol className='!mt-6 grid !list-none gap-3 !pl-0 sm:grid-cols-2 lg:grid-cols-3 [&>li+li]:!mt-0'>
				{STEPS.map((step, i) => (
					<li key={step.what} className='flex flex-col border border-[var(--rule)] bg-[var(--paper-2)] p-4'>
						<span className='flex items-center gap-2'>
							<span className='font-mono text-[0.6875rem] font-semibold tabular-nums text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
							<span className='text-[0.875rem] font-bold text-[var(--ink)]'>{step.what}</span>
							{i < STEPS.length - 1 ? <ArrowRightIcon size={13} weight='bold' className='ml-auto text-[var(--ink-mute)]' aria-hidden='true' /> : null}
						</span>
						<span className='mt-1.5 text-[0.78125rem] leading-[1.65] text-[var(--ink-3)]'>{step.detail}</span>
					</li>
				))}
			</ol>
			<figcaption className={CAPTION}>Software, including AI tools, does much of the collecting, reading and extracting. What is published follows the rules below, and every fact keeps its source.</figcaption>
		</figure>
	)
}

/* ---- 2. One record, with what stands behind it ---- */

const FIELDS = [
	{ field: 'Office', value: 'Ministry of the Interior and Local Government' },
	{ field: 'Head', value: 'The minister, as the newest dated official record names them' },
	{ field: 'As of', value: 'The date of that record' },
	{ field: 'Phone, email', value: 'Only as an official page prints them' },
	{ field: 'Past heads', value: 'Kept, each with the dates the sources support' },
]

export function Record() {
	return (
		<figure className={FIG}>
			<p className={KICKER}>What a record carries</p>
			<p className='mt-2 text-[0.9375rem] font-bold leading-snug text-[var(--ink)]'>Each fact sits beside the page it came from.</p>
			<div className='!mt-6 border border-[var(--rule)] bg-[var(--paper-2)]'>
				<dl className='divide-y divide-[var(--rule-soft)]'>
					{FIELDS.map((f) => (
						<div key={f.field} className='grid gap-x-6 gap-y-0.5 px-4 py-3 sm:grid-cols-[9rem_1fr]'>
							<dt className='font-mono text-[0.65625rem] font-semibold uppercase leading-6 tracking-[0.12em] text-[var(--ink-3)]'>{f.field}</dt>
							<dd className='!m-0 text-[0.84375rem] leading-6 text-[var(--ink)]'>{f.value}</dd>
						</div>
					))}
				</dl>
				<p className='flex items-center gap-1.5 border-t border-[var(--rule)] px-4 py-3 text-[0.78125rem] text-[var(--accent)]'>
					Source: the official page, with its date <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
				</p>
			</div>
			<figcaption className={CAPTION}>A field the sources don’t fill stays empty, and the page says so: “Not named in an official source”, or “No public number or email found”.</figcaption>
		</figure>
	)
}

export const HOW_FIGURES = {
	pipeline: <Pipeline />,
	record: <Record />,
}
