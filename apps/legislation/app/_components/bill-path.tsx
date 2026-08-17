import { BILL_PATH_STEPS } from './bill-path-steps'
import { Reveal } from './reveal'
import { Timeline } from './timeline'

/* ============================================================
   The path a bill takes, walked down the page

   The home page carries the same seven steps as a rail you click through,
   because there it is a summary standing in for a page. Here it is the page,
   so nothing is hidden behind a control: every stage is open, in order, and
   a reader can scroll or search the whole path.
   ============================================================ */

export function BillPath({ id }: { id: string }) {
	return (
		<Reveal>
			{/* `scroll-mt` clears the sticky header, so a jump from the index lands
			    on the kicker rather than behind the bar. */}
			<section id={id} className='scroll-mt-32 py-12 font-sans lg:py-14'>
				<p className='eyebrow'>The process, simplified</p>
				<h2 className='section-title mt-4 max-w-3xl'>Seven steps, and one of them is yours.</h2>
				<p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>
					Parliament publishes this path as thirteen steps of rules citations. It is the same path
					either way — and at the committee stage, its own rules say it may solicit opinions from
					the public.
				</p>

				<Timeline
					className='mt-12 max-w-4xl'
					items={BILL_PATH_STEPS.map((step) => ({
						id: step.label,
						tone: step.tone,
						content: (
							<>
								{/* No "step N of 7" caption: the dot, the spine, and the order
								    down the page already say where a step sits. */}
								<h3 className='font-title text-[1.5rem] font-extrabold leading-tight text-[var(--ink)]'>
									{step.label}
								</h3>
								{/* The line you would say out loud, before the paragraph that
								    qualifies it. */}
								<p className='copy mt-2 font-semibold text-[var(--ink)]'>{step.summary}</p>
								<div className='copy mt-3 text-[var(--ink-2)]'>{step.detail}</div>

								{step.publicAction ? (
									<div className='mt-6 border-t border-[var(--rule-soft)] pt-5'>
										<p className='text-sm leading-6 text-[var(--ink-2)]'>
											{step.publicAction.text}
										</p>
										<a
											href={step.publicAction.href}
											{...(step.publicAction.href.startsWith('http')
												? { target: '_blank', rel: 'noreferrer' }
												: {})}
											className='btn btn-quiet mt-4'
										>
											{step.publicAction.label}
										</a>
									</div>
								) : null}
							</>
						),
					}))}
				/>

				<p className='meta-sm mt-10 max-w-4xl'>
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
				</p>
			</section>
		</Reveal>
	)
}
