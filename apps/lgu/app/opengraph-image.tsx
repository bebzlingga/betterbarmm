import { ImageResponse } from 'next/og'

/* ============================================================
   The card a shared link unfurls into

   Every workspace on this estate was shared as a bare line of text: a title,
   a description, and whatever grey placeholder the platform draws when a page
   offers no image. A link to a public record ought to look like the record.

   Drawn rather than photographed, and drawn from the same parts the pages are:
   the dark ground the estate's own bands use, the brass, the woven tile this
   workspace grounds itself in, and the two-tone headline every masthead here
   opens with. The dark ground is deliberate — a white card disappears into a
   feed, and the estate spends its dark exactly once per page for the same
   reason.

   No web font is loaded. `ImageResponse` has to be handed font data, which
   means either shipping a copy of Outfit beside this file or fetching it at
   build time; the first duplicates a font the app already loads and the second
   makes the build need the network. The card leans on weight, size and
   tracking instead, which is most of what the display face was doing here.
   ============================================================ */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'BetterBARMM — every local government unit in the Bangsamoro'

/** The same tile the pages ground themselves in — the estate's own head-cloth: the pis siyabit's nested diamonds. */
const LATTICE =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23d3a95f' stroke-width='1' stroke-opacity='0.22'%3E%3Cpath d='M32 0 L64 32 L32 64 L0 32 Z'/%3E%3Cpath d='M32 14 L50 32 L32 50 L14 32 Z'/%3E%3Cpath d='M32 27 L37 32 L32 37 L27 32 Z'/%3E%3C/g%3E%3C/svg%3E\")"

export default function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: 76,
					background: '#131312',
					backgroundImage: LATTICE,
					backgroundSize: '64px 64px',
					color: '#f4f1e9',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
					<div style={{ width: 14, height: 14, background: '#d3a95f', transform: 'rotate(45deg)' }} />
					<div
						style={{
							fontSize: 22,
							fontWeight: 700,
							letterSpacing: 4,
							textTransform: 'uppercase',
							color: '#d3a95f',
						}}
					>
						BetterBARMM · Local government
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02 }}>
						Every province,
					</div>
					<div
						style={{
							fontSize: 92,
							fontWeight: 800,
							letterSpacing: -3,
							lineHeight: 1.02,
							color: '#8c8577',
						}}
					>
						city and barangay.
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
					<div style={{ width: '100%', height: 3, background: '#d3a95f', opacity: 0.5 }} />
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}>
						<div style={{ color: '#cfc9bb' }}>
							Population, land area, and the officials elected to each.
						</div>
						<div style={{ color: '#d3a95f', letterSpacing: 2 }}>lgu.betterbarmm.com</div>
					</div>
				</div>
			</div>
		),
		size,
	)
}
