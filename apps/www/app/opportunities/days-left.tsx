'use client'

import { useSyncExternalStore } from 'react'

const DAY = 86_400_000
/** Today in Manila as a day number: the clock read as an outside value, stable for the whole day. */
const today = () => Math.floor((Date.now() + 8 * 3_600_000) / DAY)
const never = () => () => {}

/** "N days left" to a closing date, counted in Manila calendar days in the browser (the server draws nothing); red within a week. */
export function DaysLeft({ closes }: { closes: string }) {
	const now = useSyncExternalStore(never, today, () => null)
	if (now === null) return null
	const left = Math.floor((Date.parse(`${closes}T00:00:00+08:00`) + 8 * 3_600_000) / DAY) - now
	if (left < 0) return null
	return <span className={`block ${left <= 7 ? 'text-[var(--accent)]' : ''}`}>{left === 0 ? 'Closes today' : left === 1 ? '1 day left' : `${left} days left`}</span>
}
