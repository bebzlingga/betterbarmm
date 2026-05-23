export function SiteFooter() {
	return (
		<footer className='border-t border-[var(--rule)] bg-[var(--paper)] py-10 pb-5 text-[var(--ink)]'>
			<div className='mx-auto max-w-7xl px-8'>
				<div className='grid border-b border-[var(--rule)] pb-12 pt-6 sm:pb-16 sm:pt-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12'>
					<div>
						{/* <p className='eyebrow'>Transparency engine</p> */}
						<h2 className='text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl lg:pr-20'>Public information should be usable by the public.</h2>
					</div>
					<p className='mt-6 max-w-3xl text-sm! leading-snug! text-[var(--ink-2)] sm:text-base sm:leading-7 lg:mt-0 lg:pl-12'>
						BetterBARMM exists to make Bangsamoro public information more readable, traceable, and useful. We organize records with source links, context, searchable access, and long-term memory so
						citizens, journalists, researchers, and public servants can see how decisions move from documents into real life. Inspired by{' '}
						<a
							href='https://bettergov.ph'
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							bettergov.ph
						</a>
						.
					</p>
				</div>
				<p className='mt-8 font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-[var(--ink-3)] sm:mt-10 sm:text-[10px] sm:tracking-[0.2em]'>
					<span className='font-bold text-[var(--ink)]'>AI-assisted analysis.</span> BetterBARMM uses AI-assisted workflows to help parse records, organize datasets, draft summaries, and improve
					navigation across public information. Human review is still essential. Figures, labels, classifications, and summaries may contain errors or change over time, so always verify important
					details against official source documents before citing or relying on them.
				</p>
				<div className='mt-8 flex flex-col justify-between gap-4 border-t border-[var(--rule)] pt-5 font-mono text-[9px] uppercase leading-5 tracking-[0.14em] text-[var(--ink-3)] sm:mt-9 sm:flex-row sm:items-center sm:text-[10px] sm:leading-6 sm:tracking-[0.22em]'>
					<p>
						2026{' '}
						<a
							href='https://betterbarmm.com'
							target='_blank'
							rel='noreferrer'
							className='border-b border-[var(--accent)] font-bold text-[var(--ink)] hover:text-[var(--accent)]'
						>
							betterbarmm.com
						</a>{' '}
						- All content is public domain unless otherwise specified.
					</p>
					<p>
						Inspired by{' '}
						<a
							href='https://bettergov.ph'
							target='_blank'
							rel='noreferrer'
							className='border-b border-[var(--accent)] font-bold text-[var(--ink)] hover:text-[var(--accent)]'
						>
							bettergov.ph
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
