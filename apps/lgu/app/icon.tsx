import { ImageResponse } from 'next/og'

/* ============================================================
   The tab mark

   The estate had no working favicon: this app declared none, and the landing
   site pointed at a file that is not in its `public` directory — so a reader
   with two of these open saw the browser's blank page glyph twice and had to
   read the titles to tell them apart.

   The mark is the estate's own lozenge, the rotated square that opens every
   small label on every page here, on the dark ground the estate runs its
   bands on. At sixteen points a wordmark is a smudge and a medallion is mush;
   a single filled diamond survives, and it is the one shape this design system
   uses everywhere already.

   The colour is what separates the workspaces. Same mark, a green for local government —
   enough to pick this tab out of a row of them without reading a word.
   ============================================================ */

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#131312',
				}}
			>
				<div
					style={{
						width: 17,
						height: 17,
						background: '#7fae72',
						transform: 'rotate(45deg)',
					}}
				/>
			</div>
		),
		size,
	)
}
