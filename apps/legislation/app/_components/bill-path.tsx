import { BILL_PATH_STEPS, type BillStep } from './bill-path-steps'
import { ArrowUpRightIcon, HandWavingIcon } from '@phosphor-icons/react/dist/ssr'
import { Head } from './explainer'
import { Reveal } from './reveal'
import { Timeline } from './timeline'

/* ============================================================
   The path a bill takes, walked down the page

   The home page carries the same seven steps as a rail you click through,
   because there it is a summary standing in for a page. Here it is the page,
   so nothing is hidden behind a control: every stage is open, in order, and
   a reader can scroll or search the whole path.
   ============================================================ */

export function BillPath({
	id,
	steps = BILL_PATH_STEPS,
	title = 'Seven steps, and one of them is yours.',
	lead = 'Parliament publishes this path as thirteen steps of rules citations. It is the same path either way — and at the committee stage, its own rules say it may solicit opinions from the public.',
	note,
}: {
	id: string
	steps?: BillStep[]
	title?: string
	lead?: string
	/** The line under the path saying where it was simplified from. */
	note?: React.ReactNode
}) {
	return (
		<Reveal>
			{/* `scroll-mt` clears the sticky header, so a jump from the index lands
			    on the kicker rather than behind the bar. */}
			<section id={id} className='scroll-mt-24 font-sans'>
				<Head label='The process, simplified' title={title} lead={lead} />

				<Timeline
					className='mt-12'
					items={steps.map((step) => ({
						id: step.label,
						tone: step.tone,
						content: (
							<div className={`rounded-[var(--dv-r)] border bg-[var(--paper)] p-6 sm:p-7 ${step.publicAction ? 'border-[var(--accent)] shadow-[0_24px_50px_-34px_rgba(138,36,24,0.55)]' : 'border-[var(--rule)]'}`}>
								{/* No "step N of 7" caption: the dot, the spine, and the order
								    down the page already say where a step sits. */}
								<h3 className='flex flex-wrap items-center gap-3 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									{step.label}
									{step.publicAction ? (
										<span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white'>
											<HandWavingIcon size={13} weight='fill' aria-hidden='true' />
											Your stage
										</span>
									) : null}
								</h3>
								{/* The line you would say out loud, before the paragraph that
								    qualifies it. */}
								<p className='copy mt-2 font-semibold text-[var(--ink)]'>{step.summary}</p>
								<div className='copy mt-3 text-[var(--ink-2)]'>{step.detail}</div>

								{step.publicAction ? (
									<div className='mt-6 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_7%,var(--paper))] p-5'>
										<p className='bb-body text-[var(--ink-2)]'>
											{step.publicAction.text}
										</p>
										<a
											href={step.publicAction.href}
											{...(step.publicAction.href.startsWith('http')
												? { target: '_blank', rel: 'noreferrer' }
												: {})}
											className='dv-btn dv-btn-accent mt-4 !px-5 !py-2.5 !text-[0.875rem]'
										>
											{step.publicAction.label}
											<ArrowUpRightIcon size={14} weight='bold' aria-hidden='true' />
										</a>
									</div>
								) : null}
							</div>
						),
					}))}
				/>

				<p className='meta-sm mt-10'>
					{note ?? <>
					Simplified from Parliament&rsquo;s{' '}
					<a
						href='https://parliament.bangsamoro.gov.ph/legislative-process-bill/'
						target='_blank'
						rel='noreferrer'
						className='rule-link'
					>
						legislative process
					</a>
					, which sets out the same path in thirteen steps against the BTA Parliamentary Rules.
					</>}
				</p>
			</section>
		</Reveal>
	)
}
