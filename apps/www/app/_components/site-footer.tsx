export function SiteFooter() {
	return (
		<footer className='bb-footer'>
			<div className='bb-container'>
				<div className='bb-footer-main'>
					<div>
						{/* <p className='eyebrow'>Transparency engine</p> */}
						<h2 className='bb-footer-title'>Public information should be usable by the public.</h2>
					</div>
					<p className='bb-footer-copy'>
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
				<p className='bb-footer-note'>
					<span className='font-bold text-[var(--ink)]'>AI-assisted analysis.</span> BetterBARMM uses AI-assisted workflows to help parse records, organize datasets, draft summaries, and improve
					navigation across public information. Human review is still essential. Figures, labels, classifications, and summaries may contain errors or change over time, so always verify important
					details against official source documents before citing or relying on them.
				</p>
				<div className='bb-footer-bottom'>
					<p>
						2026{' '}
						<a
							href='https://betterbarmm.com'
							target='_blank'
							rel='noreferrer'
							className='bb-footer-link'
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
							className='bb-footer-link'
						>
							bettergov.ph
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
