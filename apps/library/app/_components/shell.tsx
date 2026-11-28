import { DragScroll } from './drag-scroll'
import { LibraryFooter } from './library-footer'
import { PageFade } from './page-fade'
import { SiteNav } from './site-nav'

/** Every page closes as travel's do (user decision: the travel look): the ask on a warm band, then the workspace's own footer. */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>
				<PageFade>{children}</PageFade>
			</main>
			<LibraryFooter />
			<DragScroll />
		</div>
	)
}
