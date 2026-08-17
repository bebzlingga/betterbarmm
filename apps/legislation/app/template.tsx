import { ScrollToTop } from './_components/scroll-to-top'

// A template re-mounts on every navigation, so the pure-CSS `.page-enter` fade
// replays each time a new route loads — and the scroll reset runs with it.
export default function Template({ children }: { children: React.ReactNode }) {
	return (
		<div className='page-enter'>
			<ScrollToTop />
			{children}
		</div>
	)
}
