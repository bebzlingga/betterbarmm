import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { AUDIENCE, offersTotal, offices } from '../_lib/services'

export const metadata: Metadata = {
	title: 'Scholarships and services',
	description: 'What the Bangsamoro Government offers students, teachers and schools: scholarships, training, grants and the services its offices give over the counter, with how to get each.',
}

const WWW = 'https://betterbarmm.com/services'

export default function ServicesPage() {
	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='Scholarships and services'
				note={`${offersTotal} programs and services for students, teachers and schools, from ${offices.length} offices of the Bangsamoro Government: who each is for and how to get it, as the office itself states it. The full record, office by office, is on betterbarmm.com.`}
			/>

			<section className='bb-container bb-section'>
				<div className='space-y-14'>
					{offices.map((o) => (
						<section key={o.slug}>
							<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[var(--rule)] pb-3'>
								<h2 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
									{o.name}
									{o.acronym ? <span className='ml-2 text-[0.8125rem] font-semibold text-[var(--ink-3)]'>{o.acronym}</span> : null}
								</h2>
								<a href={`${WWW}/${o.slug}`} className='rule-link inline-flex items-center gap-1 text-[0.8125rem]'>
									Everything it offers <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
								</a>
							</div>
							<ul className='mt-4 grid gap-4 md:grid-cols-2'>
								{o.offers.map((x) => (
									<li key={x.kind + x.name} className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5'>
										<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{x.kind === 'program' ? 'Program' : 'Service'}</span>
										<h3 className='mt-2 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{x.name}</h3>
										{x.summary ? <p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{x.summary}</p> : null}
										<p className='mt-3 text-[0.78125rem] text-[var(--ink-3)]'>For {x.for.map((a) => AUDIENCE[a] ?? a).join(', ').toLowerCase()}</p>
										{x.how ? (
											<p className='mt-3 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>
												<span className='font-semibold text-[var(--ink)]'>{x.kind === 'program' ? 'How: ' : 'Where: '}</span>
												{x.how}
											</p>
										) : null}
										{x.fee || x.time ? (
											<p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>
												{[x.fee ? `Fee: ${x.fee}` : null, x.time ? `Takes: ${x.time}` : null].filter(Boolean).join(' · ')}
											</p>
										) : null}
										{x.requirements.length ? (
											<details className='mt-3 text-[0.8125rem]'>
												<summary className='cursor-pointer font-semibold text-[var(--ink-2)]'>What to bring ({x.requirements.length})</summary>
												<ul className='mt-2 list-disc space-y-1 pl-5 leading-5 text-[var(--ink-2)]'>
													{x.requirements.map((r) => (
														<li key={r}>{r}</li>
													))}
												</ul>
											</details>
										) : null}
										<a href={x.source} target='_blank' rel='noreferrer' className='rule-link mt-auto self-start pt-4 text-[0.71875rem] text-[var(--ink-3)]'>
											Source
										</a>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
				<p className='mt-12 max-w-[44rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Read from each office’s Citizen’s Charter and website, as the Programs &amp; services record on betterbarmm.com keeps them; requirements,
					fees and times are the office’s own, so confirm with it before you go. The education ministry’s website turns away automated visits,
					so its Citizen’s Charter has not been read; its scholarships are listed as its portal and the Bangsamoro Government describe them.
				</p>
			</section>
		</>
	)
}
