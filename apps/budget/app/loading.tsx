'use client'

import { PageSkeleton } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in: its shape in grey (user decision), inside the shell the layout keeps, on the
   crimson band this workspace's mastheads use. A client component only to read the path: the FAQs open on a centred
   masthead with the search under it, every other page on one ranged left. */
export default function Loading() {
	return usePathname() === '/faq' ? (
		<PageSkeleton band='bb-crimson' center pad='masthead-band' field='mt-9 h-[3.1rem] max-w-[34rem]' />
	) : (
		<PageSkeleton band='bb-crimson' />
	)
}
