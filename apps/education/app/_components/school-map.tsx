'use client'

import { Skeleton } from '@betterbarmm/editorial'
import dynamic from 'next/dynamic'
import type { MapSchool } from '../_lib/school-types'
import type { Fly } from './school-map-canvas'

/* MapLibre wants a window: the canvas is loaded in the browser only, with a grey block in its place until then. */
const Canvas = dynamic(() => import('./school-map-canvas'), {
	ssr: false,
	loading: () => <Skeleton className='size-full rounded-none' />,
})

export function SchoolMap({
	schools,
	focus,
	selectedId,
	onSelect,
	fly,
	className = 'h-[32rem]',
}: {
	schools: MapSchool[]
	focus?: { lon: number; lat: number; zoom: number }
	selectedId?: string | null
	onSelect?: (id: string) => void
	fly?: Fly
	className?: string
}) {
	return (
		<div className={`relative overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper-2)] shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] ${className}`}>
			<Canvas schools={schools} focus={focus} selectedId={selectedId} onSelect={onSelect} fly={fly} />
		</div>
	)
}
