/* The landing site's Commons helpers (apps/www/app/_lib/commons.ts), for the places' photographs here. */

/** A Commons photo at a width Commons serves (250, 330, 500, 960, 1280, 1920; others answer 400).
 *  An original file's URL is turned into its thumbnail's, so a card never pulls the full upload. */
/** A Commons thumbnail at one of the widths Commons serves. Commons will not scale a file up, so where
 *  the original (of: its width) is no wider than asked, the original itself is the answer. */
export function commonsThumb(url: string, w: 250 | 330 | 500 | 960 | 1280, of?: number) {
	if (of && of <= w && !/\/thumb\//.test(url)) return url
	if (/\/\d+px-/.test(url)) return url.replace(/\/\d+px-/, `/${w}px-`)
	const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w\/\w\w)\/(.+)$/)
	return m ? `${m[1]}/thumb/${m[2]}/${m[3]}/${w}px-${m[3]}` : url
}

/** A photo's white margins as fractions of its sides, [top, right, bottom, left], measured offline. */
export type Crop = [number, number, number, number]
type Framed = { width: number; height: number; crop?: Crop; focus?: string }

/** The shape of the picture inside the file, once its white margins are set aside. */
export const contentAspect = ({ width, height, crop = [0, 0, 0, 0] }: Framed) =>
	(width * (1 - crop[1] - crop[3])) / (height * (1 - crop[0] - crop[2]))

/**
 * Where to put a photo with white margins so that only the picture fills a frame of the given aspect:
 * the whole file is scaled until the picture covers the frame, then placed (at its focus, centred by
 * default) so the margins fall outside it. The frame needs `relative overflow-hidden`. Null when the
 * photo has no margins, and plain object-cover will do.
 */
export function cropStyle({ width: W, height: H, crop, focus }: Framed, frame: number): React.CSSProperties | null {
	if (!crop) return null
	const [t, r, b, l] = crop
	const cw = W * (1 - l - r)
	const ch = H * (1 - t - b)
	const k = Math.max(frame / cw, 1 / ch)
	const [fx, fy] = [0, 1].map((i) => parseFloat(focus?.split(' ')[i] ?? '') || 50)
	const left = (frame - cw * k) * (fx / 100) - W * l * k
	const top = (1 - ch * k) * (fy / 100) - H * t * k
	return { position: 'absolute', maxWidth: 'none', objectFit: 'fill', width: `${((W * k) / frame) * 100}%`, height: `${H * k * 100}%`, left: `${(left / frame) * 100}%`, top: `${top * 100}%` }
}
