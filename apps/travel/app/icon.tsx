import { ImageResponse } from 'next/og'

/* The estate's lozenge on its dark ground, in the color that separates this
   workspace from the other five. Same mark everywhere, a different hue each
   time — enough to pick this tab out of a row of them without reading a word.
   Travel takes the deep sea-blue; nothing else on the estate uses it. */

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
						background: '#5f9ea8',
						transform: 'rotate(45deg)',
					}}
				/>
			</div>
		),
		size,
	)
}
