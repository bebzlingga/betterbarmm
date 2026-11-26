/* `bun render.ts <out-dir> [--palette crimson|pearl] [--size 512] [--only a,b,c] [--animate a,b,c|all] [--frames 48]`

   Drives renderer.html in headless Chrome over the DevTools protocol: every icon (or --only) as a still PNG at
   --size, and every --animate icon as a looping animated WebP (img2webp) of --frames frames. The page is served
   from this folder by a throwaway static server so its modules and glyphs.json load. */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (name: string, fallback = '') => {
	const i = args.indexOf(`--${name}`)
	return i >= 0 ? args[i + 1] : fallback
}
const out = path.resolve(args[0] ?? 'out')
const palette = flag('palette', 'crimson')
const size = Number(flag('size', '512'))
const only = flag('only').split(',').filter(Boolean)
const animate = flag('animate').split(',').filter(Boolean)
const frames = Number(flag('frames', '48'))

// A static server for this folder, with `three` mapped to the copy the websites install.
const here = import.meta.dir
const threeDir = path.resolve(here, '../../../node_modules/.bun/three@0.186.1/node_modules/three')
const server = Bun.serve({
	port: 8799,
	fetch(req) {
		const url = new URL(req.url).pathname
		const file = url.startsWith('/three/') ? path.join(threeDir, url.slice(7)) : path.join(here, url === '/' ? 'renderer.html' : url)
		return new Response(Bun.file(file))
	},
})

const chrome = Bun.spawn(
	['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '--headless=new', '--remote-debugging-port=9334', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--user-data-dir=/private/tmp/claude-501/icons3d-profile', 'about:blank'],
	{ stdout: 'ignore', stderr: 'ignore' },
)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
let tabs: { type: string; webSocketDebuggerUrl: string }[] = []
for (let i = 0; i < 60 && !tabs.length; i++) {
	try { tabs = (await (await fetch('http://127.0.0.1:9334/json')).json()).filter((t: { type: string }) => t.type === 'page') } catch {}
	await wait(200)
}
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map<number, (v: any) => void>()
ws.onmessage = (e) => {
	const m = JSON.parse(String(e.data))
	if (m.id && pending.has(m.id)) { pending.get(m.id)!(m.result); pending.delete(m.id) }
}
const send = (method: string, params: object = {}) => new Promise<any>((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evaluate = async (expression: string) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value

await send('Page.navigate', { url: 'http://127.0.0.1:8799/' })
for (let i = 0; i < 100 && !(await evaluate('window.ready === true')); i++) await wait(200)
const names: string[] = only.length ? only : await evaluate('window.names')
if (animate[0] === 'all') animate.splice(0, 1, ...names)

const png = (dataUrl: string) => Buffer.from(dataUrl.split(',')[1], 'base64')
const missing: string[] = []

mkdirSync(out, { recursive: true })
let done = 0
for (const name of names) {
	const data = await evaluate(`render(${JSON.stringify(name)}, { palette: ${JSON.stringify(palette)}, size: ${size} })`)
	if (!data) { missing.push(name); continue }
	writeFileSync(path.join(out, `${name}.png`), png(data))
	if (++done % 100 === 0) console.log(`${done}/${names.length}`)
}

if (animate.length) {
	const animated = path.join(out, 'animated')
	mkdirSync(animated, { recursive: true })
	for (const name of animate) {
		const tmp = path.join('/private/tmp/claude-501/icons3d-frames', name)
		rmSync(tmp, { recursive: true, force: true })
		mkdirSync(tmp, { recursive: true })
		const files: string[] = []
		for (let f = 0; f < frames; f++) {
			const data = await evaluate(`render(${JSON.stringify(name)}, { palette: ${JSON.stringify(palette)}, size: ${size}, t: ${f / frames} })`)
			if (!data) break
			const file = path.join(tmp, `${String(f).padStart(3, '0')}.png`)
			writeFileSync(file, png(data))
			files.push(file)
		}
		if (!files.length) { missing.push(name); continue }
		// 40 ms a frame: a 48-frame loop is just under two seconds.
		const run = Bun.spawnSync(['img2webp', '-loop', '0', '-lossy', '-q', '82', '-d', '40', ...files, '-o', path.join(animated, `${name}.webp`)])
		if (run.exitCode !== 0) console.error(`img2webp failed for ${name}: ${run.stderr}`)
	}
}

console.log(`rendered ${done} stills${animate.length ? ` and ${animate.length - missing.filter((m) => animate.includes(m)).length} animations` : ''} to ${out}${missing.length ? `; not in Phosphor: ${missing.join(', ')}` : ''}`)
ws.close()
chrome.kill()
server.stop()
process.exit(0)
