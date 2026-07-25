export function ElectionFooter() {
	return (
		<footer className='bb-footer pb-12!'>
			<div className='bb-container'>
				<div className='bb-footer-main'>
					<div>
						<p className='eyebrow'>Election transparency</p>
						<h2 className='bb-footer-title mt-3'>Election records, organized for the public.</h2>
					</div>
					<p className='bb-footer-copy'>
						Public elections deserve public records. BetterBARMM gathers the 2026 BARMM Parliamentary Elections — regional parties, district COC filers, sectoral candidates, the timeline, and the
						sources behind each entry — into one place you can read, question, and trace back to where it came from.
					</p>
				</div>
				<div className='bb-footer-bottom border-t-0! pt-0!'>
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
					<p>Dataset: datasets/election/election.min.json</p>
				</div>
			</div>
		</footer>
	)
}
