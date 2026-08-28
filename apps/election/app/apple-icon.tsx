import { ImageResponse } from 'next/og'

/* The same mark at the size a home screen wants, with room for the estate's
   name under it — at 180 points a bare diamond reads as a decoration rather
   than as a site. */

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 16,
					background: '#131312',
				}}
			>
				<div
					style={{
						width: 62,
						height: 62,
						background: '#8fb0cc',
						transform: 'rotate(45deg)',
					}}
				/>
				<div
					style={{
						fontSize: 20,
						fontWeight: 700,
						letterSpacing: 3,
						textTransform: 'uppercase',
						color: '#cfc9bb',
					}}
				>
					Election
				</div>
			</div>
		),
		size,
	)
}
