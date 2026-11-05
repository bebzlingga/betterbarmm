'use client'

import { PageSkeleton } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'

/* What a page shows while it streams in: its shape in grey (user decision), inside the shell the layout keeps, on the
   brand band its mastheads use. A client component only to read the path: Explore opens on a centred band with the
   search in it, every other page on a masthead ranged left. */
export default function Loading() {
	return usePathname() === '/' ? <PageSkeleton center pad='py-16 lg:py-24' /> : <PageSkeleton />
}
