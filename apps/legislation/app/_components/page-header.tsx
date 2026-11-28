import { Hero } from './hero'
import { StatFigures, type Stat } from './stat-band'

type PageHeaderProps = {
	eyebrow: string
	title: string
	/**
	 * The second half of a two-tone headline, set in the muted grey. The dark
	 * line carries the claim; this one carries the qualifier, so the eye lands
	 * on what matters before reading the rest.
	 */
	titleMuted?: string
	/** Left off where the headline already says it. The paragraph and the space
	    it sits in both go, rather than the header keeping a gap where a
	    description used to be. */
	description?: string
	/**
	 * Headline figures, set inside the masthead under the sentence that
	 * introduces them rather than in a band of their own below it. A page whose
	 * whole subject is a set of counts wants them read as part of the opening
	 * claim.
	 */
	figures?: Stat[]
	meta?: string
	/**
	 * `brand` is for the standing pages — the hub, Data & Methodology — where
	 * the heading is the page's whole point rather than a label over a list of
	 * records. It runs large.
	 */
	emphasis?: 'default' | 'brand'
	/**
	 * Only read on `brand`. Ranged left by default: every masthead in this
	 * registry opens onto something — a list, a set of figures, a page of
	 * reference blocks — and a headline that shares an edge with what follows
	 * it gives the reader one line to come down. Centring is available for a
	 * page that is purely a statement and has nothing under it to align to.
	 */
	align?: 'center' | 'left'
	/**
	 * Only read on `brand`. `compact` steps the headline down for a masthead
	 * that is a label over a grid; `hero` steps it up, for the page that opens
	 * the registry.
	 */
	size?: 'display' | 'compact' | 'hero'
}

/**
 * The top of every page in the registry.
 *
 * On the brand crimson (user decision), which is what the budget workspace
 * does and what the landing site does. A reader crossing between the six
 * should not feel they have changed sites, and for a while this was the only
 * one opening on paper.
 *
 * `brand-bg`, the band the landing site's mastheads use (user decision), re-points every token — ink, brass, rules, the accent — so the
 * eyebrow, the headline, the description and the figures under it all restyle
 * themselves without one inverted variant written here.
 *
 * It was moved off the crimson once before, on the argument that the band is
 * spent at the foot on the closing panel and a masthead on it meant every page
 * opening and closing on the same shout. That is still true, and it is the
 * thing to watch if the pages start to feel loud: the answer then is a quieter
 * closing panel, not a paper masthead.
 *
 * The headline arrives a line at a time. Where it breaks is given rather than
 * measured — at these sizes a wrap decided by the container puts a two-letter
 * word alone on a line, and the shape falls apart.
 */
export function PageHeader({ eyebrow, title, titleMuted, description, figures, meta, size = 'display', side }: PageHeaderProps & { side?: React.ReactNode }) {
	// The crimson header every page opens on (user decision: the travel look). `emphasis` and `align` are kept for the
	// callers; every cut is ranged left now, as the landing site's are.
	return (
		<Hero
			kicker={eyebrow}
			tall={size === 'hero'}
			auto={!!figures?.length}
			side={side}
			title={
				<>
					{title}
					{titleMuted ? <span className='block text-white/55'>{titleMuted}</span> : null}
				</>
			}
			lede={description}
		>
			{figures?.length ? (
				<div className='mt-12'>
					<StatFigures stats={figures} />
				</div>
			) : null}
			{meta ? <p className='meta-sm mt-8'>{meta}</p> : null}
		</Hero>
	)
}
