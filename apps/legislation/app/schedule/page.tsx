import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { RegistryBand } from '../_components/registry-band'
import { SessionCalendar, type CalendarData } from '../_components/session-calendar'

export const metadata: Metadata = {
	title: 'Session calendar',
	description:
		'When the First Bangsamoro Parliament sits: every sitting week of its First Regular Session, 30 October 2026 to 16 September 2027, from the calendar of sessions resolution.',
}

const calendar = (() => {
	const file = ['../../datasets/bills/session-calendar.json', 'datasets/bills/session-calendar.json']
		.map((p) => path.join(process.cwd(), p))
		.find((p) => fs.existsSync(p))
	return JSON.parse(fs.readFileSync(file!, 'utf8')) as CalendarData
})()

export default function SchedulePage() {
	const { meta } = calendar
	return (
		<>
			<RegistryBand
				label={`${meta.parliament} · ${meta.session}`}
				title='Session calendar'
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>When Parliament sits. </span>
						The plenary meets in short sitting weeks, most of them Tuesday to Thursday, from the opening on 30 October 2026 to the
						mandatory adjournment on 16 September 2027. Between them the session is adjourned.
					</>
				}
			/>
			<SessionCalendar data={calendar} />
		</>
	)
}
