import { aboutTheRegion, type FetchedItem } from '../../../packages/db/src/news'

/* The posts of a public Facebook page as news items: for outlets whose news lives on Facebook (user decision: DXMS
   Radyo Bida Cotabato City, NDBC's station in the region, as a source). Facebook gives a page no feed and loads its
   posts as the page scrolls, so this drives the Mac's own Chrome, headless, over its DevTools socket: no browser
   library to install. Each post keeps its own link; the first line is its headline and the rest its teaser, the
   station's words. Live programmes are not news and are left out; so is the station talking to its listeners (user
   decision); posts must name the region, as Google News's must. */

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

export const FACEBOOK_PAGES = [{ name: 'DXMS Radyo Bida', url: 'https://www.facebook.com/profile.php?id=100068735708353' }]

type Post = { head: string; text: string; links: string[] }

/* The station talking to its listeners rather than reporting: "MALAKAS ang buhos ng ulan ngayong gabi sa Cotabato
   City. Kumusta diyan sa inyo mga Ka-Bida? Ingat po tayo!". A short post that greets, asks after, or signs off to
   the audience ("Ka-Bida" is the station's name for them) is not news (user decision), whatever place it names. */
const TO_LISTENERS = /\bka-?bida\b|\bkumusta\b|\bingat\s+po\b|^(magandang|good)\s+(umaga|tanghali|hapon|gabi|araw|morning|afternoon|evening)\b|\bstay\s+safe\b/i
export const chatter = (text: string) => text.length < 220 && TO_LISTENERS.test(text)

/* Runs in the page: scroll down the posts, opening every "See more" and reading each post on the way. Without an
   account Facebook shows a page's latest dozen or so posts and then a sign-in wall; the read stops there. On a page
   that posts as often as DXMS, that is about 6 hours, so the news wants updating more than once a day. */
const READ = async (scrolls: number) => {
	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
	const seen = new Map<string, { head: string; text: string; links: string[] }>()
	for (let t = 0; t < 40 && !document.querySelector('div[aria-posinset], div[role=article]'); t++) await sleep(500)
	await sleep(1500)
	for (let i = 0; i <= scrolls; i++) {
		// The first sign-in prompt can be closed and the page scrolls on; the second, "See more on Facebook", cannot.
		const close = document.querySelector<HTMLElement>('[role=dialog] [aria-label="Close"]')
		if (close) close.click()
		else if (document.querySelector('[role=dialog] [aria-label="Log in to Facebook"]')) break
		for (const el of [...document.querySelectorAll<HTMLElement>('[role=button]')].filter((e) => e.innerText.trim() === 'See more')) {
			el.click()
			await sleep(150)
		}
		await sleep(500)
		for (const a of document.querySelectorAll<HTMLElement>('div[aria-posinset], div[role=article]')) {
			if (a.parentElement?.closest('div[aria-posinset], div[role=article]')) continue
			const post = {
				head: a.innerText.slice(0, 300),
				text: (a.querySelector<HTMLElement>('[data-ad-rendering-role="story_message"], [data-ad-comet-preview="message"], [data-ad-preview="message"]')?.innerText ?? '').trim(),
				links: [...a.querySelectorAll<HTMLAnchorElement>('a[href]')].map((x) => x.href).filter((h) => /\/(posts|videos|reel)\/|permalink\.php\?story_fbid|story\.php\?story_fbid/.test(h)),
			}
			const key = post.text.slice(0, 80) || post.head
			// Keep the fullest reading: a post read before its "See more" opened is replaced.
			if (post.text.length >= (seen.get(key)?.text.length ?? -1)) seen.set(key, post)
		}
		window.scrollBy(0, 1500)
		await sleep(2000)
	}
	return [...seen.values()]
}

/** Chrome, headless, and a way to send it DevTools commands. */
async function chrome() {
	const dir = `${process.env.TMPDIR ?? '/tmp/'}bb-facebook-${process.pid}`
	const proc = Bun.spawn([CHROME, '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, `--user-agent=${UA}`, '--window-size=1280,2000', 'about:blank'], { stdout: 'ignore', stderr: 'pipe' })
	let log = ''
	const reader = proc.stderr.getReader()
	while (!/ws:\/\/\S+/.test(log)) {
		const { value, done } = await reader.read()
		if (done) throw new Error('Chrome did not start')
		log += new TextDecoder().decode(value)
	}
	const ws = new WebSocket(log.match(/ws:\/\/\S+/)![0])
	await new Promise((ok, fail) => ((ws.onopen = ok), (ws.onerror = fail)))
	let id = 0
	const waiting = new Map<number, (m: { result?: any; error?: { message: string } }) => void>()
	ws.onmessage = (e) => {
		const m = JSON.parse(String(e.data))
		waiting.get(m.id)?.(m)
		waiting.delete(m.id)
	}
	const send = (method: string, params: object = {}, sessionId?: string) =>
		new Promise<any>((ok, fail) => {
			waiting.set(++id, (m) => (m.error ? fail(new Error(m.error.message)) : ok(m.result)))
			ws.send(JSON.stringify({ id, method, params, sessionId }))
		})
	const close = async () => {
		await reader.cancel()
		ws.close()
		proc.kill()
		await proc.exited
		await Bun.$`rm -rf ${dir}`.quiet().nothrow()
	}
	return { send, close }
}

/** "Monday, November 16, 2026 at 9:54 PM", Manila's clock, as an ISO time. */
function when(head: string) {
	const m = head.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\w+\s+\d{1,2},\s+\d{4})\s+at\s+(\d{1,2}):(\d{2})\s*([AP]M)/)
	if (!m) return null
	const d = new Date(`${m[1]!.replace(/\s+/g, ' ')} 00:00:00 UTC`)
	const h = (Number(m[2]) % 12) + (m[4] === 'PM' ? 12 : 0)
	return new Date(d.getTime() + (h * 60 + Number(m[3])) * 60_000 - 8 * 3600_000).toISOString()
}

/** One page's recent posts about the region. */
export async function readFacebookPage(page: { name: string; url: string }, scrolls = 8): Promise<FetchedItem[]> {
	const { send, close } = await chrome()
	try {
		const { targetId } = await send('Target.createTarget', { url: page.url })
		const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
		await Bun.sleep(8000)
		const { result } = await send('Runtime.evaluate', { expression: `(${READ.toString()})(${scrolls})`, awaitPromise: true, returnByValue: true }, sessionId)
		const posts = (result.value ?? []) as Post[]
		const items: FetchedItem[] = []
		for (const post of posts) {
			// A live programme: "was live" or "is live" over it, or, once it ends, its listing ("Host: … Time: 4:00PM - 5:00PM").
			if (/ (was|is) live\b/.test(post.head) || /^Host:/m.test(post.text) || !post.text) continue
			if (chatter(post.text)) continue
			const lines = post.text.replace(/‎/g, '').replace(/\s*See less$/, '').replace(/…?\s*See more$/, '').split('\n').map((l) => l.trim()).filter(Boolean)
			const title = lines[0]!
			const rest = lines.slice(1).join(' ')
			// The first post link is the post's own (its time or its video); later ones are links in its text or comments.
			const link = post.links[0]
			if (!link || !aboutTheRegion(post.text)) continue
			const url = link.includes('.php?') ? link.replace(/&__cft__.*$/, '').replace(/&__tn__.*$/, '') : link.split('?')[0]!
			// A shared post shows inside the page's own, and both are read.
			if (items.some((i) => i.url === url)) continue
			items.push({
				url,
				title,
				source: page.name,
				summary: rest.length > 320 ? `${rest.slice(0, 320).replace(/\s+\S*$/, '')}…` : rest,
				feed: `Facebook: ${page.name}`,
				published_at: when(post.head),
				image: null,
			})
		}
		return items
	} finally {
		await close()
	}
}

if (import.meta.main && process.argv[2] === 'check') {
	// `bun datasets/news/scripts/facebook.ts check`: the chatter rule on the post that prompted it, and on reports it must keep.
	const yes = ['MALAKAS ang buhos ng ulan ngayong gabi sa Cotabato City. Kumusta diyan sa inyo mga Ka-Bida? Ingat po tayo!', 'Magandang umaga, Cotabato City! Ingat po sa biyahe.']
	const no = ['LOOK: Isang bahay sa Mother Tamontaka, Cotabato City, nasunog ngayong tanghali.', 'PINAKAMATAAS na inflation rate sa bansa, naitala ng Bangsamoro Region, ayon sa Phil. Statistics Authority',
		'UPDATE: Dalawang sundalo, biktima ng pamamaril kahapon sa Sultan Kudarat, Maguindanao del Norte; Isa patay, isa kritikal. ' + 'Ang mga biktima ay sakay ng isang motorsiklo nang pagbabarilin sa Brgy. Crossing Simuay. '.repeat(3) + 'Ingat po tayo mga Ka-Bida.']
	for (const t of yes) if (!chatter(t)) throw new Error(`kept as news: ${t}`)
	for (const t of no) if (chatter(t)) throw new Error(`struck as chatter: ${t.slice(0, 60)}`)
	console.log('ok: chatter rule')
} else if (import.meta.main) {
	console.log(JSON.stringify(await readFacebookPage(FACEBOOK_PAGES[0]!, Number(process.argv[2] ?? 4)), null, 1))
}
