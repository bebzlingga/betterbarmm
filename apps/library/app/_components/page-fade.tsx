'use client'

import { usePathname } from 'next/navigation'

/* Each page fades and rises in as it arrives (user decision: smoother transitions, without the page reloading).
   A plain CSS animation on a wrapper keyed by the address: nothing is snapshotted, so a long page cannot make
   it fail, as the browser's view transitions did on the calendar. */
export function PageFade({ children }: { children: React.ReactNode }) {
	return (
		<div key={usePathname()} className='tv-page-in'>
			{children}
		</div>
	)
}
