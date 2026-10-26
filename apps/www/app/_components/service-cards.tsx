import { ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon, UsersIcon } from '@phosphor-icons/react/ssr'
import { CATEGORY_ICONS } from './category-icons'
import Link from 'next/link'
import { OpenFromHash } from './open-from-hash'
import { audienceLabel, categoryLabel, slugify, type Audience, type Category, type Service } from '../_lib/services'

/* A charter's services as a table: on a services page each row opens on what
   to bring, the fee, the time and where to go; in the Directory each row links
   there. Shared by a regional office's page, an LGU's and the Directory, so all
   three read the same; `base` is the list the category and audience tags lead
   back to. */

const chip = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.75rem] leading-none transition'

/** Its category, then who it is for, as chips: each a link to everything else on that shelf, or for those readers. */
export function Tags({ list, category, base = '/services', className = 'mt-2' }: { list: Audience[]; category?: Category; base?: string; className?: string }) {
	if (!list.length && !category) return null
	const Glyph = category ? CATEGORY_ICONS[category] : null
	return (
		<span className={`flex flex-wrap gap-1.5 ${className}`}>
			{category ? (
				<Link href={`${base}?cat=${category}`} className={`${chip} border-[var(--accent)] font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white`}>
					{Glyph ? <Glyph size={13} weight='duotone' aria-hidden='true' /> : null}
					{categoryLabel(category)}
				</Link>
			) : null}
			{list.map((a) => (
				<Link key={a} href={`${base}?for=${a}`} className={`${chip} border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]`}>
					<UsersIcon size={13} aria-hidden='true' />
					{audienceLabel(a)}
				</Link>
			))}
		</span>
	)
}

/** A service's category inside the table: its glyph and its name, linking to its shelf. */
function CategoryLink({ id, base }: { id: Category; base: string }) {
	const Glyph = CATEGORY_ICONS[id]
	return (
		<Link href={`${base}?cat=${id}`} className='inline-flex gap-1.5 text-[var(--accent)] hover:underline hover:underline-offset-4'>
			{Glyph ? <Glyph size={15} weight='duotone' className='mt-px shrink-0' aria-hidden='true' /> : null}
			{categoryLabel(id)}
		</Link>
	)
}

export const Source = ({ url }: { url: string }) => (
	<a href={url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[0.75rem] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
		Source <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
	</a>
)

/* One column template for the header and every row, so the cells line up as
   a table's would. On a services page each row is a <details>, opening on
   what to bring; given `href` (the Directory, which shows a few of them),
   each row is a link to that service on its services page instead. */
const COLS = 'lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,1.3fr)_minmax(0,0.5fr)_1rem] lg:gap-x-12'
const HEAD = 'text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)]'
const ROW = `flex items-start gap-4 px-3 py-6 transition hover:bg-[var(--paper-2)] ${COLS}`
const anchor = (s: Service) => `service-${slugify(s.name)}`

/** A row's cells. With `href` the name is the row's link, its hit area stretched over the whole row; the category and audience links sit above it. */
function Cells({ s, base, href }: { s: Service; base: string; href?: string }) {
	return (
		<>
			<span className='min-w-0 flex-1'>
				{href ? (
					<Link href={`${href}#${anchor(s)}`} className="block text-[0.9375rem] font-semibold leading-snug after:absolute after:inset-0 after:content-['']">
						{s.name}
					</Link>
				) : (
					<span className='block text-[0.9375rem] font-semibold leading-snug'>{s.name}</span>
				)}
				{/* Its category under the name rather than in a column of its own, so the name keeps the width. */}
				{s.category ? (
					<span className='relative z-10 mt-1.5 hidden text-[0.8125rem] font-semibold leading-snug lg:block lg:w-fit'>
						<CategoryLink id={s.category} base={base} />
					</span>
				) : null}
				{/* Under the name on a narrow screen, where there are no columns to hold them. */}
				<span className='mt-1 block text-[0.78125rem] text-[var(--ink-3)] lg:hidden'>
					{[s.fee && `Fee: ${s.fee}`, s.time && `Takes ${s.time}`].filter(Boolean).join(' · ') || 'Fee and time not stated'}
				</span>
				<Tags list={s.for} category={s.category} base={base} className='relative z-10 mt-2.5 lg:hidden' />
			</span>
			{/* Who it is for as plain links, not chips: six chips in a column this narrow stacked one to a line. */}
			<span className='relative z-10 hidden text-[0.84375rem] leading-snug text-[var(--ink-2)] lg:block'>
				{s.for.length
					? s.for.map((a, i) => (
							<span key={a}>
								{i ? ', ' : null}
								<Link href={`${base}?for=${a}`} className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'>
									{audienceLabel(a)}
								</Link>
							</span>
						))
					: '—'}
			</span>
			<span className='hidden text-[0.84375rem] leading-snug text-[var(--ink-2)] lg:line-clamp-2'>
				<span className='sr-only'>Fee: </span>
				{s.fee || '—'}
			</span>
			{href ? (
				<ArrowRightIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
			) : (
				<CaretDownIcon size={16} className='mt-1 shrink-0 transition group-open:rotate-180' aria-hidden='true' />
			)}
		</>
	)
}

export function ServiceCards({ services, base = '/services', href }: { services: Service[]; base?: string; href?: string }) {
	return (
		<div className='mt-5 border-t border-[var(--rule)]'>
			<div aria-hidden='true' className={`hidden border-b border-[var(--rule)] px-3 py-2.5 ${COLS} ${HEAD}`}>
				<span>Service</span>
				<span>For</span>
				<span>Fee</span>
				<span />
			</div>
			{href ? null : <OpenFromHash />}
			<ul>
				{services.map((s) => (
					<li key={s.name} id={anchor(s)} className='relative scroll-mt-[calc(var(--site-header-h)+1rem)] border-b border-[var(--rule)]'>
						{href ? (
							<div className={ROW}>
								<Cells s={s} base={base} href={href} />
							</div>
						) : (
							<details className='group open:bg-[var(--paper-2)]'>
								<summary className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${ROW}`}>
									<Cells s={s} base={base} />
								</summary>
								<div className='max-w-3xl px-3 pb-7 pt-1 text-[0.875rem] leading-6'>
									{s.summary ? <p className='text-[var(--ink-2)]'>{s.summary}</p> : null}
									{s.requirements.length ? (
										<>
											<p className='mt-3 font-semibold'>What to bring</p>
											<ul className='mt-1 list-disc space-y-0.5 pl-5 text-[var(--ink-2)]'>
												{s.requirements.map((r) => (
													<li key={r}>{r}</li>
												))}
											</ul>
										</>
									) : null}
									<dl className='mt-3 grid gap-x-6 gap-y-1 text-[0.84375rem] sm:grid-cols-[auto_1fr]'>
										{s.fee ? (
											<>
												<dt className='text-[var(--ink-3)]'>Fee</dt>
												<dd>{s.fee}</dd>
											</>
										) : null}
										{s.time ? (
											<>
												<dt className='text-[var(--ink-3)]'>Processing time</dt>
												<dd>{s.time}</dd>
											</>
										) : null}
										{s.where ? (
											<>
												<dt className='text-[var(--ink-3)]'>Where</dt>
												<dd>{s.where}</dd>
											</>
										) : null}
									</dl>
									<p className='mt-5 border-t border-[var(--rule-soft)] pt-4'>
										<Source url={s.source} />
									</p>
								</div>
							</details>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
