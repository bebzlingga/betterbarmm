import { ArrowUpRightIcon, CaretDownIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { audienceLabel, categoryLabel, slugify, type Audience, type Category, type Service } from '../_lib/services'

/* A charter's services as cards, each opening on what to bring, the fee,
   the time and where to go. Shared by a regional office's page and an
   LGU's, so the two read the same; `base` is the list the category and
   audience tags lead back to. */

/** Its category, then who it is for: each a link to everything else on that shelf, or for those readers. */
export function Tags({ list, category, base = '/services' }: { list: Audience[]; category?: Category; base?: string }) {
	if (!list.length && !category) return null
	return (
		<p className='mt-2 flex flex-wrap gap-1.5'>
			{category ? (
				<Link href={`${base}?cat=${category}`} className='border border-[var(--accent)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'>
					{categoryLabel(category)}
				</Link>
			) : null}
			{list.map((a) => (
				<Link key={a} href={`${base}?for=${a}`} className='border border-[var(--rule)] px-2 py-0.5 text-[11.5px] text-[var(--ink-2)] hover:border-[var(--ink)]'>
					{audienceLabel(a)}
				</Link>
			))}
		</p>
	)
}

export const Source = ({ url }: { url: string }) => (
	<a href={url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[12px] text-[var(--ink-3)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
		Source <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
	</a>
)

export function ServiceCards({ services, base = '/services' }: { services: Service[]; base?: string }) {
	return (
		<ul className='mt-5 space-y-3'>
			{services.map((s) => (
				<li key={s.name} id={`service-${slugify(s.name)}`} className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
					<details className='group border border-[var(--rule)] open:border-[var(--ink)]'>
						<summary className='flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-6 sm:px-7 [&::-webkit-details-marker]:hidden'>
							<span className='min-w-0'>
								<span className='block text-[15.5px] font-semibold leading-snug'>{s.name}</span>
								<span className='mt-1 block text-[12.5px] text-[var(--ink-3)]'>
									{[s.fee && `Fee: ${s.fee}`, s.time && `Takes ${s.time}`].filter(Boolean).join(' · ') || 'Fee and time not stated'}
								</span>
							</span>
							<CaretDownIcon size={16} className='mt-1 shrink-0 transition group-open:rotate-180' aria-hidden='true' />
						</summary>
						<div className='border-t border-[var(--rule-soft)] px-5 pb-7 pt-5 text-[14px] leading-6 sm:px-7 sm:pb-8'>
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
							<dl className='mt-3 grid gap-x-6 gap-y-1 text-[13.5px] sm:grid-cols-[auto_1fr]'>
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
							<Tags list={s.for} category={s.category} base={base} />
							<p className='mt-5 border-t border-[var(--rule-soft)] pt-4'>
								<Source url={s.source} />
							</p>
						</div>
					</details>
				</li>
			))}
		</ul>
	)
}
