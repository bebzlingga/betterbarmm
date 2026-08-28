import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MotionProvider, SiteFooter } from '@betterbarmm/editorial'
import { themeInitScript } from './_components/theme-toggle'
import './globals.css'

// DM Sans reads the body copy, Outfit sets headings, buttons and labels.
// Both are variable, so every weight the design uses comes from one file each.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BetterBARMM | Better Transparency. Better Governance.',
  description:
    'A public transparency project for the Bangsamoro. Public records — elections, laws, budgets — organised into workspaces you can read, question, and trace back to the source.',
	/* Absolute, because everything below it is relative. Without a
	   `metadataBase` the generated card resolves to a path rather than a URL,
	   and a platform scraping the page has nothing to fetch — which is why a
	   shared link unfurled as a bare line of text. */
	metadataBase: new URL('https://betterbarmm.com'),
	applicationName: 'BetterBARMM',

	/* One estate across four addresses: every card names the estate, then the
	   workspace. `openGraph.images` is left unset so the generated
	   `opengraph-image` beside this file fills it in — naming it here would
	   override the per-route cards a page can bring of its own. */
	openGraph: {
		type: 'website',
		siteName: 'BetterBARMM',
		locale: 'en_PH',
		url: 'https://betterbarmm.com',
		title: 'BetterBARMM | Better Transparency. Better Governance.',
		description:
			'A public transparency project for the Bangsamoro. Public records — elections, laws, budgets — organised into workspaces you can read, question, and trace back to the source.',
	},

	/* The canonical address, and permission to index it.
	   Four apps on four subdomains serve overlapping subjects — an act appears
	   on the registry and is linked from the election workspace — so each page
	   naming its own address is what stops a crawler treating a link as a
	   duplicate of the page it points at. */
	alternates: { canonical: 'https://betterbarmm.com' },
	robots: { index: true, follow: true },
	authors: [{ name: 'BetterBARMM', url: 'https://betterbarmm.com' }],
	creator: 'BetterBARMM',
	publisher: 'BetterBARMM',
	/* A page of act numbers, seat counts and dates is full of strings a phone
	   will turn into telephone links if it is not told otherwise. */
	formatDetection: { telephone: false, date: false, address: false, email: false },

	twitter: {
		card: 'summary_large_image',
		title: 'BetterBARMM | Better Transparency. Better Governance.',
		description:
			'A public transparency project for the Bangsamoro. Public records — elections, laws, budgets — organised into workspaces you can read, question, and trace back to the source.',
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      // The theme script below writes `data-theme` to <html> ahead of React,
      // so the server's markup and the client's differ by that one attribute.
      suppressHydrationWarning
      className={`${dmSans.variable} ${outfit.variable} h-full bg-[var(--paper)] text-[var(--ink)]`}
    >
      <head>
        {/* Resolves the theme before first paint, so a dark-mode reader never
            gets a white flash on load or navigation. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/* Motion renders an animation's opening frame into the server's HTML —
            that is what stops the flash of un-animated content on hydration.
            The cost is that without JavaScript nothing ever advances past that
            opening frame, and an `opacity: 0` inline style is a blank page.

            So every primitive that starts hidden carries `data-anim`, and this
            rule releases all of them at once. It has to be `!important`: the
            styles it is overriding are inline, and an ordinary declaration in a
            stylesheet loses to those. */}
        <noscript>
          <style>{`[data-anim]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className='min-h-full bg-[var(--paper)] antialiased'>
        <MotionProvider>
          {children}
          <SiteFooter />
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  )
}
