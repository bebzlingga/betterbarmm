import { RootComingSoonPage } from '../_components/root-coming-soon-page'

export default function ContactPage() {
	return (
		<RootComingSoonPage
			activeItem='contact'
			eyebrow='Contact BetterBARMM'
			title='A proper inbox is coming.'
			description={
				<>
					We are setting up a better way to receive corrections, source leads, dataset questions, and collaboration notes without losing the public trail. For now, email <br />
					<a
						href='mailto:support@betterbarmm.com'
						className='rule-link '
					>
						support@betterbarmm.com
					</a>
					.
				</>
			}
			notes={[
				'Use this page soon for feedback on figures, labels, classifications, and missing public records.',
				'Correction workflows will prioritize source links, reproducible notes, and clear review status.',
				'Partnership and research inquiries will have a dedicated route once the contact layer opens.',
			]}
		/>
	)
}
