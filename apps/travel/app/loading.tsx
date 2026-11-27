'use client'

import { usePathname } from 'next/navigation'
import { TravelSkeleton } from './_components/travel-skeleton'

/* What a page shows while it streams in (user decision: match the layout); the shapes are in
   _components/travel-skeleton.tsx, chosen by the address being opened. */
export default function Loading() {
	return <TravelSkeleton path={usePathname()} />
}
