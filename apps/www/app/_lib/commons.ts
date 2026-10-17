/** A Commons photo at a width Commons serves (250, 330, 500, 960, 1280, 1920; others answer 400).
 *  An original file's URL is turned into its thumbnail's, so a card never pulls the full upload. */
export function commonsThumb(url: string, w: 250 | 330 | 500 | 960 | 1280) {
	if (/\/\d+px-/.test(url)) return url.replace(/\/\d+px-/, `/${w}px-`)
	const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w\/\w\w)\/(.+)$/)
	return m ? `${m[1]}/thumb/${m[2]}/${m[3]}/${w}px-${m[3]}` : url
}
