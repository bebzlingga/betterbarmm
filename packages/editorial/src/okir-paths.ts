/* ============================================================
   Okir — the path data

   Okir (ukkil, okkil) is the curvilinear carving tradition of the
   Maranao, Maguindanaon, Tausug, and Sama peoples: the scrollwork on a
   torogan's panolong, the frame of a kulintang, the prow of a lepa.
   Three of its named motifs are drawn here, reduced to single strokes
   so they can be animated and so they read as ornament rather than as
   illustration:

     · pako rabong — the growing fern, a symmetrical frond rising from
       a base, the motif that anchors the centre of a panel
     · todi — the leaf that hangs off a stem, drawn here as the small
       curve under each scroll
     · obid-obid — the running scroll, the S-curve with a spiral
       terminal that carries a motif along a beam

   The geometry lives here rather than inside the components because
   both a static server-rendered cut and an animated client one draw
   the same shapes, and two copies of a path would drift.

   Everything is authored to be stroked, never filled: `fill="none"`
   with a round cap and join. A filled okir at these opacities turns
   into a smudge.
   ============================================================ */

/**
 * One half of the running rule, authored left of centre.
 *
 * The mirrored half is the same array under a `scale(-1, 1)`, which is how the
 * real thing is carved — a panolong is symmetrical about its own centre line,
 * and drawing the right half by hand would guarantee the two never quite
 * matched.
 *
 * The viewBox is close to square-ish on purpose. An earlier cut ran the beam
 * the full width of the page and stretched a 1200-unit box across it with
 * `preserveAspectRatio: none`, which squashed the fern to half its height and
 * turned a carving into a smear. The motif is now drawn at its own proportions
 * and centred, with a plain hairline carrying it out to the page edges — which
 * is how the ornament sits on an actual beam anyway.
 */
export const OKIR_RULE_LEFT = [
  // The obid-obid: out of the beam, up over a shoulder, and round into a spiral
  // that closes on itself.
  'M0 32 C40 32 56 33 74 26 C96 17 102 7 118 9 C133 11 137 24 124 30 C115 34 106 29 111 22',
  // The todi hanging under it.
  'M74 26 C80 35 91 41 103 40 C113 39 119 34 118 28',
  // And the link on towards the fern, so the run reads as growing rather than
  // as one repeated unit.
  'M118 28 C132 30 140 38 152 38',
] as const

/** The pako rabong at the centre: a frond and the base it rises from. */
export const OKIR_RULE_CENTRE = [
  // The stem.
  'M180 46 V22',
  // The frond, curling away to each side from a single tip.
  'M180 22 C180 11 169 5 161 11 C154 16 157 25 165 24',
  'M180 22 C180 11 191 5 199 11 C206 16 203 25 195 24',
  // The base it grows out of.
  'M152 46 C166 46 171 41 180 41 C189 41 194 46 208 46',
] as const

export const OKIR_RULE_VIEWBOX = '0 0 360 64'

/* ------------------------------------------------------------
   The bloom

   A medallion rather than a rule, sitting behind a masthead at very
   low contrast. Its job is to give a large empty ground something
   happening in it without ever competing with the type on top.

   The first cut of this repeated a pako rabong — a stem whose tip
   splits into two mirrored curls — six times around the centre. On its
   own that is the correct motif. At masthead scale, cropped by the
   edge of a section so that one arm is most of what you see, a pair of
   large mirrored lobes joined at a point reads as something else
   entirely, and once seen it cannot be unseen.

   So the medallion is drawn in the tradition's geometric register
   instead of its curvilinear one — the okir of a woven pis siyabit and
   a chased brass gadur rather than of a carved panolong. Nothing here
   is a mirrored pair: a lancet is a single pointed leaf, a stud is a
   diamond, and both are repeated often enough round the circle that
   any crop reads as radial pattern rather than as a shape. The
   curvilinear cut of the motif is still on the site, at sizes where it
   is read whole — the running rule and the corner marks.
   ------------------------------------------------------------ */

/**
 * One petal, pointing up from the centre.
 *
 * A lancet: two arcs meeting at a point at each end, so the silhouette is a
 * leaf rather than a lobe. It spans the gap between the middle and outer
 * rings, and is authored once and rotated `OKIR_BLOOM_PETALS` times.
 */
export const OKIR_BLOOM_PETAL = [
  'M200 82 C185 62 185 42 200 22 C215 42 215 62 200 82 Z',
  // The vein down the middle, which is what stops a petal at this opacity
  // reading as a flat sliver.
  'M200 74 V32',
] as const

/** A stud on the inner band — the step-diamond of a woven pis siyabit. */
export const OKIR_BLOOM_STUD = 'M200 108 L207 115 L200 122 L193 115 Z'

/** The centre: a diamond with short spokes radiating off it. */
export const OKIR_BLOOM_CORE = ['M200 190 L210 200 L200 210 L190 200 Z', 'M200 182 V156'] as const

export const OKIR_BLOOM_RINGS = [52, 118, 178] as const
export const OKIR_BLOOM_PETALS = 12
export const OKIR_BLOOM_STUDS = 16
export const OKIR_BLOOM_SPOKES = 8
export const OKIR_BLOOM_VIEWBOX = '0 0 400 400'

/**
 * The medallion in each workspace's own hand.
 *
 * Same carving throughout — three rings, a repeated figure between the middle
 * and outer one, a band of studs, a spoked centre — and a different figure in
 * each room. The construction, the stroke, the drawing-on and the slow turn
 * are the estate's; only what is repeated round the circle changes, which is
 * enough for two mastheads to be plainly the same workshop and plainly not the
 * same piece.
 *
 * `bloom` is the okir itself and stays the default: a workspace that asks for
 * nothing gets the estate's own.
 */
export type OkirBloomVariant = 'bloom' | 'weave' | 'tally'

export const OKIR_BLOOM_VARIANTS: Record<
	OkirBloomVariant,
	{ petal: readonly string[]; stud: string; petals: number; studs: number; spokes: number }
> = {
	bloom: {
		petal: OKIR_BLOOM_PETAL,
		stud: OKIR_BLOOM_STUD,
		petals: OKIR_BLOOM_PETALS,
		studs: OKIR_BLOOM_STUDS,
		spokes: OKIR_BLOOM_SPOKES,
	},

	// The registry's. The lancet squares off into the stepped chevron an inaul
	// throws up where weft crosses warp, and there are more of them: a register
	// is a thing counted in rows, and the ring should read as courses rather
	// than as a flower.
	weave: {
		petal: ['M200 84 L184 60 L200 36 L216 60 Z', 'M200 72 L192 60 L200 48 L208 60 Z'],
		stud: 'M194 109 H206 M194 121 H206 M194 109 V121 M206 109 V121',
		petals: 16,
		studs: 24,
		spokes: 4,
	},

	// The election's. The figure is the mark a hand makes when it counts —
	// four uprights and the fifth laid across them — turned round the circle,
	// so the medallion is a tally the moment before it is read.
	tally: {
		petal: ['M200 84 V34', 'M188 44 L212 34'],
		stud: 'M200 108 L206 115 L200 122 L194 115 Z',
		petals: 20,
		studs: 12,
		spokes: 8,
	},
}

/* ------------------------------------------------------------
   The corner

   The smallest cut: an angle with a single scroll turning out of it.
   Used on the one panel per page that carries weight, at all four
   corners under a rotation, so the panel reads as framed rather than
   as bordered.
   ------------------------------------------------------------ */

export const OKIR_CORNER = [
  'M2 46 V14 C2 7 7 2 14 2 H46',
  'M14 34 C14 22 22 14 34 14',
  'M34 14 C46 14 52 22 48 30 C45 36 37 36 36 30 C35 25 40 23 43 26',
] as const

export const OKIR_CORNER_VIEWBOX = '0 0 56 56'
