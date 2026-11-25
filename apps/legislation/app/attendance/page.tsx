import type { Metadata } from 'next'
import { AttendanceExplorer } from '../_components/attendance-explorer'
import { RegistryBand } from '../_components/registry-band'
import { getAttendance } from '../_lib/attendance-data'

export const metadata: Metadata = {
	title: 'Attendance',
	description:
		'Who turned up: every Member of the Bangsamoro Transition Authority, present, absent or on leave at each sitting with a published journal, 2019 to 2023.',
}

export default function AttendancePage() {
	const data = [
		{ key: 'BTA1' as const, label: 'First Transition Authority', years: '2019–2022', attendance: getAttendance('BTA1') },
		{ key: 'BTA2' as const, label: 'Second Transition Authority', years: '2022–2025', attendance: getAttendance('BTA2') },
	]
	const sittings = data.reduce((n, d) => n + d.attendance.sittings.length, 0)
	return (
		<>
			<RegistryBand
				label='From the plenary journals'
				title='Attendance'
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>Who turned up. </span>
						{`Every Member of the Transition Authority at each of the ${sittings} sittings with a published journal: present, absent, or on leave or official business, as the roll call recorded it.`}
					</>
				}
			/>
			<AttendanceExplorer data={data} />
		</>
	)
}
