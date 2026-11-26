/* `node mobile/ios/scripts/icons.mjs` — the app's icons, from Phosphor (the set the websites use, via
   @phosphor-icons/react), written into the asset catalog as vector template images: `ph-<name>` for the regular
   weight and `ph-<name>-fill` for the filled one. Add a name to ICONS and run it again. */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const PKG = fs.realpathSync(path.join(ROOT, 'apps/www/node_modules/@phosphor-icons/react'))
const OUT = path.resolve(import.meta.dirname, '../BetterBARMM/Assets.xcassets/Icons')

// Phosphor component name → the app's asset name.
const ICONS = {
	House: 'house', Bank: 'bank', MapTrifold: 'map', Bell: 'bell', MagnifyingGlass: 'search', XCircle: 'x-circle',
	Newspaper: 'newspaper', Warning: 'warning', ArrowLeft: 'arrow-left', Link: 'link', PaperPlaneTilt: 'send',
	MapPin: 'map-pin', ArrowUpRight: 'arrow-up-right', FileText: 'file-text', SealCheck: 'seal-check', Question: 'question',
	Phone: 'phone', FacebookLogo: 'facebook', Info: 'info', Image: 'image', Island: 'island', Waves: 'waves',
	Drop: 'drop', Mountains: 'mountains', Mosque: 'mosque', Columns: 'columns', Tree: 'tree', Storefront: 'storefront',
	Bed: 'bed', ForkKnife: 'fork-knife', CheckCircle: 'check-circle', Circle: 'circle', Bookmark: 'bookmark',
	Clock: 'clock', Gavel: 'gavel', Sparkle: 'sparkle', Compass: 'compass', ShieldCheck: 'shield-check',
	Buildings: 'buildings', Coins: 'coins', CheckSquare: 'check-square', ShoppingCart: 'cart', Handshake: 'handshake',
	GraduationCap: 'graduation-cap', Books: 'books', Lifebuoy: 'lifebuoy', ChartLineUp: 'chart-up', Yarn: 'yarn',
	Database: 'database', SquaresFour: 'squares', User: 'user', Sliders: 'sliders', TextAa: 'text-aa', Moon: 'moon',
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 }, properties: { 'provides-namespace': false } }))

const missing = []
for (const [component, name] of Object.entries(ICONS)) {
	const file = path.join(PKG, 'dist/defs', `${component}.es.js`)
	if (!fs.existsSync(file)) { missing.push(component); continue }
	const src = fs.readFileSync(file, 'utf8')
	for (const weight of ['regular', 'fill']) {
		// Each weight is a block of createElement("path", { d: "..." }) calls between its name and the next weight's.
		const start = src.indexOf(`"${weight}"`)
		const end = src.indexOf('\n  [\n', start + 1)
		const block = src.slice(start, end < 0 ? undefined : end)
		const paths = [...block.matchAll(/d: "([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`).join('')
		if (!paths) { missing.push(`${component}/${weight}`); continue }
		const asset = weight === 'fill' ? `ph-${name}-fill` : `ph-${name}`
		const dir = path.join(OUT, `${asset}.imageset`)
		fs.mkdirSync(dir)
		fs.writeFileSync(path.join(dir, `${asset}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="#000">${paths}</svg>`)
		fs.writeFileSync(path.join(dir, 'Contents.json'), JSON.stringify({
			images: [{ filename: `${asset}.svg`, idiom: 'universal' }],
			info: { author: 'xcode', version: 1 },
			properties: { 'template-rendering-intent': 'template', 'preserves-vector-representation': true },
		}, null, 2))
	}
}
console.log(`icons: ${Object.keys(ICONS).length - missing.length} written${missing.length ? `, missing ${missing.join(', ')}` : ''}`)
