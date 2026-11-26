/* `node glyphs.mjs` — every Phosphor icon's filled glyph (the paths of its "fill" weight on the 256 grid), from the
   @phosphor-icons/react copy the websites install, into glyphs.json for the 3D renderer. */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const DEFS = path.join(fs.realpathSync(path.join(ROOT, 'apps/www/node_modules/@phosphor-icons/react')), 'dist/defs')
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()

const out = {}
for (const file of fs.readdirSync(DEFS).filter((f) => f.endsWith('.es.js'))) {
	const src = fs.readFileSync(path.join(DEFS, file), 'utf8')
	const start = src.indexOf('"fill"')
	const end = src.indexOf('\n  [\n', start + 1)
	const paths = [...src.slice(start, end < 0 ? undefined : end).matchAll(/d: "([^"]+)"/g)].map((m) => m[1])
	if (paths.length) out[kebab(file.replace('.es.js', ''))] = paths
}
fs.writeFileSync(path.join(import.meta.dirname, 'glyphs.json'), JSON.stringify(out))
console.log(`glyphs: ${Object.keys(out).length}`)
