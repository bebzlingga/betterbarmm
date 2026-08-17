// A template re-mounts on every navigation, so the pure-CSS `.page-enter` fade
// replays each time a new page loads.
export default function Template({ children }: { children: React.ReactNode }) {
	return <div className='page-enter'>{children}</div>
}
