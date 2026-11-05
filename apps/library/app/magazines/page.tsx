import type { Metadata } from 'next'
import { ArrowSquareOutIcon } from '@phosphor-icons/react/ssr'
import { CHIP, Masthead } from '../_components/parts'
import { magazines } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Magazines',
	description: 'The magazines, newsletters, journals and reports the Bangsamoro Government’s ministries and offices publish, issue by issue.',
}

const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

export default function MagazinesPage() {
	const issues = magazines.reduce((n, m) => n + m.issues.length, 0)
	return (
		<>
			<Masthead kicker='Library · Bangsamoro' name='The offices’ magazines' note={`${magazines.length} magazines, newsletters, journals and reports from the region’s ministries, offices and agencies, with ${issues} issues found online so far. Each issue opens on the office’s own site.`} />
			<div className='bb-container bb-section grid gap-12'>
				{magazines.map((m) => (
					<article key={m.slug} id={m.slug} className='grid scroll-mt-24 gap-6 border-t border-[var(--rule)] pt-8 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-12'>
						<div>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
								{m.kind}
								{m.frequency ? ` · ${m.frequency}` : ''}
								{m.since ? ` · since ${m.since}` : ''}
							</p>
							<h2 className='mt-2 font-[family-name:var(--font-display)] text-[1.5rem] font-black leading-tight tracking-[-0.03em] text-[var(--ink)]'>{m.title}</h2>
							<p className='mt-1 text-[0.875rem] font-semibold text-[var(--ink-2)]'>
								{m.office}
								{m.acronym ? ` (${m.acronym})` : ''}
							</p>
							<p className='mt-3 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{m.about}</p>
							{m.url ? (
								<a href={m.url} target='_blank' rel='noreferrer' className={`${CHIP} mt-4`}>
									{host(m.url)} <ArrowSquareOutIcon size={12} aria-hidden='true' />
								</a>
							) : null}
						</div>
						<div>
							<p className='text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
								{m.issues.length} {m.issues.length === 1 ? 'issue' : 'issues'} found
							</p>
							{m.issues.length ? null : <p className='mt-3 text-[0.875rem] text-[var(--ink-2)]'>The issues are listed on the office’s own page.</p>}
							<ul className='mt-3 grid gap-1 sm:grid-cols-2'>
								{m.issues.map((i) => (
									<li key={i.url} className='border-b border-[var(--rule-soft)]'>
										<a href={i.url} target='_blank' rel='noreferrer' className='flex items-baseline justify-between gap-3 py-2 text-[0.875rem] text-[var(--ink)] hover:text-[var(--accent)]'>
											<span>{i.label}</span>
											{i.date ? <span className='num shrink-0 text-[0.75rem] text-[var(--ink-3)]'>{i.date}</span> : null}
										</a>
									</li>
								))}
							</ul>
						</div>
					</article>
				))}
			</div>
		</>
	)
}
