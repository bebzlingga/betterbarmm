import { RootComingSoonPage } from '../_components/root-coming-soon-page'

export default function AboutPage() {
	return (
		<RootComingSoonPage
			activeItem='about'
			eyebrow='About BetterBARMM'
			title='The public layer is taking shape.'
			description='We are preparing a clearer story about BetterBARMM, why it exists, how it handles public records, and how the project can help people follow Bangsamoro governance with more confidence.'
			notes={[
				'Project background, editorial principles, and source-first methods are being written for public review.',
				'The goal is simple: make public information easier to inspect, question, reuse, and cite responsibly.',
				'More context on partners, inspirations, and roadmap will land here soon.',
			]}
		/>
	)
}
