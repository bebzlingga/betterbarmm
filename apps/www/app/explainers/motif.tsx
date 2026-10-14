import type { Motif } from './guides'

/* ============================================================
   A guide card's picture

   Not a chart of anything: a hint at the shape of what the guide
   explains, a different one for each. Drawn on the site's tokens, so
   it holds in both themes, and hidden from screen readers, since the
   title says it.
   ============================================================ */

const A = 'var(--accent)'
const B = 'var(--brass)'
const R = 'var(--rule)'
const P = 'var(--paper)'
const I = 'var(--ink)'

const DRAW: Record<Motif, React.ReactNode> = {
	// Parliament: the seats of a chamber, a few of them filled.
	chamber: (
		<g>
			{[0, 1, 2].flatMap((row) => {
				const r = 34 + row * 16
				const n = 7 + row * 3
				return Array.from({ length: n }, (_, i) => {
					const t = Math.PI - (Math.PI * i) / (n - 1)
					return <circle key={`${row}-${i}`} cx={120 + r * Math.cos(t)} cy={86 - r * Math.sin(t)} r='4.5' fill={(i + row) % 3 === 0 ? A : row === 2 ? R : B} />
				})
			})}
		</g>
	),
	// Questions asked and answered.
	questions: (
		<g>
			<rect x='44' y='14' width='104' height='34' rx='4' fill={A} />
			<path d='M64 48 L58 60 L76 48 Z' fill={A} />
			<rect x='100' y='54' width='96' height='30' rx='4' fill={P} stroke={B} strokeWidth='2' />
			<line x1='60' y1='28' x2='130' y2='28' stroke={P} strokeWidth='3' strokeLinecap='round' />
			<line x1='60' y1='37' x2='110' y2='37' stroke={P} strokeWidth='3' strokeLinecap='round' opacity='0.7' />
			<line x1='114' y1='66' x2='180' y2='66' stroke={B} strokeWidth='3' strokeLinecap='round' />
			<line x1='114' y1='74' x2='160' y2='74' stroke={B} strokeWidth='3' strokeLinecap='round' opacity='0.6' />
		</g>
	),
	// The budget year: prepared, enacted, released, audited, and round again.
	cycle: (
		<g>
			<circle cx='120' cy='48' r='30' fill='none' stroke={R} strokeWidth='6' />
			<path d='M120 18 A30 30 0 0 1 150 48' fill='none' stroke={A} strokeWidth='6' />
			<path d='M150 48 A30 30 0 0 1 120 78' fill='none' stroke={B} strokeWidth='6' />
			<path d='M146 40 L152 50 L158 40 Z' fill={A} />
			{[
				[120, 18],
				[150, 48],
				[120, 78],
				[90, 48],
			].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r='6' fill={i < 2 ? A : i === 2 ? B : P} stroke={i === 3 ? R : 'none'} strokeWidth='2' />
			))}
		</g>
	),
	// One budget, split three ways: people, operations, capital.
	stack: (
		<g>
			<rect x='30' y='36' width='92' height='24' fill={A} />
			<rect x='124' y='36' width='54' height='24' fill={B} />
			<rect x='180' y='36' width='30' height='24' fill={R} />
			{[
				[30, 'PS'],
				[124, 'MOOE'],
				[180, 'CO'],
			].map(([x, label]) => (
				<text key={label as string} x={(x as number) + 2} y='76' fontSize='9' fontWeight='700' fill={I} opacity='0.55' fontFamily='inherit'>
					{label}
				</text>
			))}
		</g>
	),
	// Province, city or town, barangay.
	levels: (
		<g>
			<rect x='96' y='12' width='48' height='18' fill={A} />
			<rect x='68' y='38' width='104' height='18' fill={B} opacity='0.75' />
			<rect x='36' y='64' width='168' height='18' fill={R} />
		</g>
	),
	// Powers handed down from the region to its local governments.
	flow: (
		<g>
			<rect x='98' y='8' width='44' height='22' fill={A} />
			<path d='M120 30 V44 M60 44 H180 M60 44 V58 M120 44 V58 M180 44 V58' stroke={B} strokeWidth='2' fill='none' />
			{[40, 100, 160].map((x) => (
				<rect key={x} x={x} y='58' width='40' height='22' fill={P} stroke={B} strokeWidth='2' />
			))}
		</g>
	),
	// A code: a document of numbered sections.
	document: (
		<g>
			<rect x='84' y='8' width='72' height='82' fill={P} stroke={B} strokeWidth='2' />
			<rect x='84' y='8' width='72' height='14' fill={A} />
			{[34, 46, 58, 70].map((y, i) => (
				<g key={y}>
					<text x='92' y={y + 3} fontSize='8' fontWeight='700' fill={A} fontFamily='inherit'>
						§
					</text>
					<line x1='102' y1={y} x2={i % 2 ? 136 : 146} y2={y} stroke={R} strokeWidth='3' strokeLinecap='round' />
				</g>
			))}
		</g>
	),
	// Where a local government's money comes from: one large share, several small.
	ring: (
		<g transform='translate(120 48)'>
			<circle r='32' fill='none' stroke={R} strokeWidth='14' />
			<circle r='32' fill='none' stroke={A} strokeWidth='14' strokeDasharray='140 201' transform='rotate(-90)' />
			<circle r='32' fill='none' stroke={B} strokeWidth='14' strokeDasharray='34 201' strokeDashoffset='-142' transform='rotate(-90)' />
		</g>
	),
	// Pay by post: a ladder of grades.
	ladder: (
		<g>
			{[0, 1, 2, 3, 4].map((i) => (
				<rect key={i} x={44 + i * 32} y={78 - (i + 1) * 13} width='28' height={(i + 1) * 13} fill={i === 4 ? A : i === 3 ? B : R} />
			))}
			<line x1='36' y1='78' x2='204' y2='78' stroke={R} strokeWidth='2' />
		</g>
	),
	// Public bidding, one step after the next.
	steps: (
		<g>
			<line x1='28' y1='48' x2='212' y2='48' stroke={R} strokeWidth='2' />
			<line x1='28' y1='48' x2='120' y2='48' stroke={A} strokeWidth='2' />
			{[28, 74, 120, 166, 212].map((x, i) => (
				<circle key={x} cx={x} cy='48' r={i === 2 ? 9 : 6} fill={i <= 2 ? A : P} stroke={i <= 2 ? A : R} strokeWidth='2' />
			))}
		</g>
	),
	// Budget, bid out, awarded: three amounts for one office, as the page sets them.
	peso: (
		<g>
			<rect x='40' y='20' width='160' height='12' fill={R} />
			<rect x='40' y='42' width='118' height='12' fill={A} />
			<rect x='40' y='64' width='64' height='12' fill={I} />
		</g>
	),
}

export function GuideMotif({ motif }: { motif: Motif }) {
	return (
		<svg viewBox='0 0 240 96' aria-hidden='true' className='block h-24 w-full'>
			{DRAW[motif]}
		</svg>
	)
}
