import type { Metadata } from 'next'

/* ============================================================
   A page's metadata

   Each page names its own canonical address and social card. The
   layout cannot: anything it sets is inherited by every page under
   it, which is how every page once told search engines it was the
   home page. Titles go through the layout's "%s — BetterBARMM".
   ============================================================ */

export const SITE = 'https://betterbarmm.com'

/** The site's generated card. A page that sets its own social card drops the
    layout's image, so every page names it again. */
export const CARD = { url: '/opengraph-image', width: 1200, height: 630, alt: 'BetterBARMM' }

export function pageMeta({
	title,
	description,
	path,
	index = true,
}: {
	/** Without the site name; the layout's template adds it. */
	title: string
	description: string
	/** The page's own path, "/about". */
	path: string
	/** False for pages that should not appear in search results. */
	index?: boolean
}): Metadata {
	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: { type: 'website', siteName: 'BetterBARMM', locale: 'en_PH', url: path, title: `${title} — BetterBARMM`, description, images: [CARD] },
		twitter: { card: 'summary_large_image', title: `${title} — BetterBARMM`, description, images: [CARD.url] },
		...(index ? {} : { robots: { index: false, follow: true } }),
	}
}
