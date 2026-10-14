import type { Motif } from './guides'

/* ============================================================
   A guide card's picture

   Not a chart of anything: a hint at the shape of what the guide
   explains — a sequence, amounts set side by side, tiers, money handed
   down, questions answered. Drawn on the site's tokens, so it holds in
   both themes, and hidden from screen readers, since the title says it.
   ============================================================ */

const A = 'var(--accent)'
const B = 'var(--brass)'
const R = 'var(--rule)'

export function GuideMotif({ motif }: { motif: Motif }) {
	return (
		<svg viewBox='0 0 240 96' aria-hidden='true' className='block h-24 w-full'>
			{motif === 'steps' ? (
				<g>
					<line x1='28' y1='48' x2='212' y2='48' stroke={R} strokeWidth='2' />
					<line x1='28' y1='48' x2='120' y2='48' stroke={A} strokeWidth='2' />
					{[28, 74, 120, 166, 212].map((x, i) => (
						<circle key={x} cx={x} cy='48' r={i === 2 ? 9 : 6} fill={i <= 2 ? A : 'var(--paper)'} stroke={i <= 2 ? A : R} strokeWidth='2' />
					))}
				</g>
			) : motif === 'bars' ? (
				<g>
					{[52, 78, 34, 64, 44].map((h, i) => (
						<rect key={i} x={40 + i * 34} y={84 - h} width='20' height={h} fill={i === 1 ? A : i % 2 ? B : R} opacity={i === 1 ? 1 : 0.7} />
					))}
					<line x1='28' y1='84' x2='212' y2='84' stroke={R} strokeWidth='2' />
				</g>
			) : motif === 'peso' ? (
				// Budget, bid out, awarded: three amounts for one office, as the page sets them.
				<g>
					<rect x='40' y='20' width='160' height='12' fill={R} />
					<rect x='40' y='42' width='118' height='12' fill={A} />
					<rect x='40' y='64' width='64' height='12' fill={'var(--ink)'} />
				</g>
			) : motif === 'levels' ? (
				<g>
					<rect x='96' y='12' width='48' height='18' fill={A} />
					<rect x='68' y='38' width='104' height='18' fill={B} opacity='0.75' />
					<rect x='36' y='64' width='168' height='18' fill={R} />
				</g>
			) : motif === 'flow' ? (
				<g>
					<rect x='98' y='8' width='44' height='22' fill={A} />
					<path d='M120 30 V44 M60 44 H180 M60 44 V58 M120 44 V58 M180 44 V58' stroke={B} strokeWidth='2' fill='none' />
					{[40, 100, 160].map((x) => (
						<rect key={x} x={x} y='58' width='40' height='22' fill='var(--paper)' stroke={B} strokeWidth='2' />
					))}
				</g>
			) : (
				<g>
					<rect x='44' y='14' width='104' height='34' rx='4' fill={A} />
					<path d='M64 48 L58 60 L76 48 Z' fill={A} />
					<rect x='100' y='54' width='96' height='30' rx='4' fill='var(--paper)' stroke={B} strokeWidth='2' />
					<line x1='60' y1='28' x2='130' y2='28' stroke='var(--paper)' strokeWidth='3' strokeLinecap='round' />
					<line x1='60' y1='37' x2='110' y2='37' stroke='var(--paper)' strokeWidth='3' strokeLinecap='round' opacity='0.7' />
					<line x1='114' y1='66' x2='180' y2='66' stroke={B} strokeWidth='3' strokeLinecap='round' />
					<line x1='114' y1='74' x2='160' y2='74' stroke={B} strokeWidth='3' strokeLinecap='round' opacity='0.6' />
				</g>
			)}
		</svg>
	)
}
