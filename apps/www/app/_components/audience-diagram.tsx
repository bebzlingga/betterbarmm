'use client'

import { motion } from 'motion/react'
import { EASE } from '@betterbarmm/editorial'
import { Drawn, Node, Stroke } from './diagram-kit'

/* ============================================================
   Who it serves, drawn

   The one section on the site that is about people rather than about
   records, so it is the one place a figure belongs. Each drawing is
   a reader and the thing they came for: a question looked up, a
   claim traced back to its document, three years set side by side,
   a counter with a page on it.

   The figures are held to the same vocabulary as everything else
   here — thin strokes, one weight, the rotated square that means a
   record — so a person reads as another mark in the same hand rather
   than as clip art dropped into a diagram. All four are
   `aria-hidden`; the heading and the sentence beside them carry the
   meaning.
   ============================================================ */

/**
 * A reader, as two strokes.
 *
 * A circle and the arc of a pair of shoulders. Anything more — a face, arms, a
 * posture — starts describing a particular person, and the point of these is
 * that they are anybody.
 */
function Person({
	x,
	headY,
	drawn,
	delay = 0,
	r = 9,
	w = 19,
	color = 'var(--ink)',
}: {
	x: number
	headY: number
	drawn: boolean
	delay?: number
	/** Head radius. The shoulders are drawn from it, so this sets the scale. */
	r?: number
	/** Half the shoulder width. */
	w?: number
	color?: string
}) {
	const shoulderY = headY + r + w + 4

	return (
		<>
			<motion.circle
				cx={x}
				cy={headY}
				r={r}
				fill='none'
				stroke={color}
				strokeWidth={1.5}
				initial={{ scale: 0, opacity: 0 }}
				animate={drawn ? { scale: 1, opacity: 1 } : undefined}
				style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
				transition={{ duration: 0.45, delay, ease: EASE }}
			/>
			<Stroke
				d={`M${x - w} ${shoulderY} A${w} ${w} 0 0 1 ${x + w} ${shoulderY}`}
				drawn={drawn}
				delay={delay + 0.1}
				duration={0.5}
				color={color}
				width={1.5}
			/>
		</>
	)
}

/**
 * Citizens — someone looking something up.
 *
 * A page with the lens over it and the record found inside. It was a ballot and
 * a seat, which drew one errand out of the many this site is for; the general
 * case is a person with a question and a document that can answer it.
 */
export function LookupDiagram() {
	return (
		<Drawn>
			{(drawn) => (
				<>
					<Person x={30} headY={30} drawn={drawn} delay={0} />

					{/* The page. */}
					<Stroke d='M72 16 H142 V96 H72 Z' drawn={drawn} delay={0.45} color='var(--ink)' />
					<Stroke d='M82 32 H132' drawn={drawn} delay={0.75} duration={0.35} color='var(--ink-3)' width={1.2} />
					<Stroke d='M82 46 H112' drawn={drawn} delay={0.83} duration={0.35} color='var(--rule)' width={1.2} />

					{/* The lens, drawn as one closed arc so it travels like every other
					    stroke here rather than appearing whole. */}
					<Stroke
						d='M92 70 A20 20 0 1 1 91.9 70'
						drawn={drawn}
						delay={0.95}
						duration={0.8}
						color='var(--brass)'
						width={1.5}
					/>
					<Stroke d='M126 84 L142 100' drawn={drawn} delay={1.5} duration={0.3} color='var(--brass)' width={2} />

					{/* What they were looking for. */}
					<Node x={112} y={70} drawn={drawn} delay={1.6} size={11} />
				</>
			)}
		</Drawn>
	)
}

/**
 * Journalists and researchers — a reader, a document, and the claim walked
 * back to it.
 *
 * The mark at the top is the number as it reaches them; the dashed route runs
 * back down to the page it came off. It is drawn as a route rather than a rail
 * because nothing carries them along it — they go and check.
 */
export function TrailDiagram() {
	return (
		<Drawn>
			{(drawn) => (
				<>
					<Person x={32} headY={38} drawn={drawn} delay={0} />

					{/* The document. */}
					<Stroke d='M78 34 H136 V100 H78 Z' drawn={drawn} delay={0.45} color='var(--ink)' />
					<Stroke d='M88 50 H126' drawn={drawn} delay={0.8} duration={0.35} color='var(--brass)' width={1.2} />
					<Stroke d='M88 64 H126' drawn={drawn} delay={0.88} duration={0.35} color='var(--rule)' width={1.2} />
					<Stroke d='M88 78 H112' drawn={drawn} delay={0.96} duration={0.35} color='var(--rule)' width={1.2} />

					{/* The claim, and the route back to the page. */}
					<Node x={128} y={14} drawn={drawn} delay={1.05} size={13} />
					<Stroke
						d='M128 22 V30 H104 V34'
						drawn={drawn}
						delay={1.2}
						duration={0.6}
						color='var(--brass)'
						width={1.3}
						dashed
					/>
				</>
			)}
		</Drawn>
	)
}

/**
 * Civil society — three readers on one baseline, and the same measure taken
 * three times.
 *
 * The group is the point: this is the row that works in numbers, and what it
 * needs is not one figure but the same figure drawn to the same scale more
 * than once.
 */
export function CompareDiagram() {
	return (
		<Drawn>
			{(drawn) => (
				<>
					<Person x={30} headY={26} drawn={drawn} delay={0} r={7} w={14} color='var(--ink-3)' />
					<Person x={80} headY={20} drawn={drawn} delay={0.15} r={8} w={16} />
					<Person x={130} headY={26} drawn={drawn} delay={0.3} r={7} w={14} color='var(--ink-3)' />

					{/* One baseline under all three, with the measure on it. */}
					<Stroke d='M12 84 H148' drawn={drawn} delay={0.6} color='var(--brass)' width={1.4} />

					<Stroke d='M22 84 V72 H38 V84' drawn={drawn} delay={0.85} duration={0.4} color='var(--ink-3)' width={1.3} />
					<Stroke d='M72 84 V62 H88 V84' drawn={drawn} delay={0.95} duration={0.4} color='var(--ink)' width={1.3} />
					<Stroke d='M122 84 V76 H138 V84' drawn={drawn} delay={1.05} duration={0.4} color='var(--ink-3)' width={1.3} />

					<Node x={80} y={100} drawn={drawn} delay={1.25} size={9} />
				</>
			)}
		</Drawn>
	)
}

/**
 * Public servants — someone at the counter, looking at what their own office
 * has published.
 *
 * Two rules on the page are solid and one is dashed, with the accent mark set
 * against the missing one. An office reading its own record is usually looking
 * for that line.
 */
export function GapDiagram() {
	return (
		<Drawn>
			{(drawn) => (
				<>
					<Person x={34} headY={26} drawn={drawn} delay={0} />

					{/* The counter they stand behind. */}
					<Stroke d='M10 84 H150' drawn={drawn} delay={0.5} color='var(--ink-3)' width={1.5} />

					{/* The page on it, and the line that is not there. */}
					<Stroke d='M78 24 H144 V76 H78 Z' drawn={drawn} delay={0.7} color='var(--ink)' />
					<Stroke d='M88 40 H134' drawn={drawn} delay={1} duration={0.35} color='var(--ink-3)' width={1.3} />
					<Stroke d='M88 54 H134' drawn={drawn} delay={1.08} duration={0.35} color='var(--ink-3)' width={1.3} />
					<Stroke
						d='M88 66 H134'
						drawn={drawn}
						delay={1.16}
						duration={0.35}
						color='var(--rule)'
						width={1.3}
						dashed
					/>
					<Node x={78} y={66} drawn={drawn} delay={1.4} size={9} />
				</>
			)}
		</Drawn>
	)
}
