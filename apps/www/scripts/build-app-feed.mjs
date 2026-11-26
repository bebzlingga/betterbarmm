/* `node scripts/build-app-feed.mjs` — the read-only feed the BetterBARMM iOS app (mobile/ios) reads, written to
   public/app/v1/ and served at https://betterbarmm.com/app/v1/*.json. Build output, like public/data/files: run
   before `next dev` and `next build`, so every data push that redeploys www refreshes it.

   One file per section, trimmed to what the app shows, and a manifest the app fetches first. Every record carries
   a stable `id`, which is how the app tells what is new since it last looked and decides what to notify about —
   the same ids a push sender would use later.

   Images are absolute URLs on the site that already hosts the copy: place photos on www (public/places), stay and
   eat photos on travel. */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const APP = path.resolve(import.meta.dirname, '..')
const DATA = path.resolve(APP, '../../datasets')
const OUT = path.join(APP, 'public/app/v1')
const WWW = 'https://betterbarmm.com'
const TRAVEL = 'https://travel.betterbarmm.com'

const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'))
const id = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12)
const abs = (base, url) => (!url ? null : url.startsWith('http') ? url : base + url)
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

/* ---- News: the last five weekly files, newest first, without the stories the page strikes. */
const index = read('news/index.json')
const dropped = new Set((index.dropped ?? []).map((d) => d.url))
const news = index.weeks
	.slice(0, 5)
	.flatMap((week) => read(`news/weeks/${week}.json`).items)
	.filter((s) => !dropped.has(s.url))
	.sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
	.map((s) => ({
		id: id(s.url),
		title: s.title,
		source: s.source,
		summary: s.summary ?? null,
		url: s.url,
		published: s.published_at,
		image: s.image ?? null,
	}))

/* ---- Incidents: the last 120 days. */
const incidents = read('accidents/accidents.json')
	.incidents.filter((i) => i.date >= daysAgo(120))
	.sort((a, b) => b.date.localeCompare(a.date))
	.map((i) => ({
		id: id(`${i.date}|${i.title}`),
		date: i.date,
		kind: i.kind,
		title: i.title,
		summary: i.summary,
		province: i.province ?? null,
		municipality: i.municipality ?? null,
		deaths: i.deaths ?? 0,
		injured: i.injured ?? 0,
		lat: i.lat ?? null,
		lon: i.lon ?? null,
	}))

/* ---- Legislation: bills (id changes with status, so a bill moving a stage counts as new) and acts. */
const bills = read('bills/bangsamoro_registry/bills/_index.json')
	.bills.sort((a, b) => b.bill_number - a.bill_number)
	.map((b) => ({
		id: `bill-${b.bill_number}-${id(b.status ?? '')}`,
		number: b.bill_number,
		title: b.short_title,
		summary: b.one_liner ?? null,
		status: b.status ?? null,
		asOf: b.as_of ?? null,
		tags: b.tags ?? [],
		url: `https://legislation.betterbarmm.com/bills/${b.bill_number}`,
	}))
const acts = read('bills/baa.min.json')
	.records.sort((a, b) => b.baa_number - a.baa_number)
	.map((a) => ({
		id: `baa-${a.baa_number}`,
		number: a.baa_number,
		title: a.title_short,
		officialTitle: a.title_official ?? null,
		date: a.date_approved_or_enacted_iso ?? null,
		category: a.category ?? null,
		pdf: a.source_link ?? null,
		url: `https://legislation.betterbarmm.com/acts/${a.baa_number}`,
	}))

/* ---- Places, stays and eats. A place photo is served from www's own copy when it has one. */
const local = new Set(fs.readdirSync(path.join(APP, 'public/places')))
const credit = (img) => ({ author: img.author ?? null, license: img.license ?? null, page: img.page ?? null })
const places = read('places/places.json').items.map((p) => ({
	id: p.slug,
	name: p.name,
	kind: p.kind,
	area: p.area,
	municipality: p.municipality ?? null,
	summary: p.summary ?? null,
	detail: p.detail ?? [],
	beforeYouGo: p.before_you_go ?? [],
	gettingThere: p.getting_there ?? null,
	bestTime: p.best_time ?? null,
	do: (p.do ?? []).map((d) => ({ title: d.title, detail: d.detail ?? null })),
	images: (p.images ?? []).map((img, i) => {
		const file = `${p.slug}__${i + 1}.jpg`
		return { url: local.has(file) ? `${WWW}/places/${file}` : img.url, caption: img.caption ?? null, ...credit(img) }
	}),
	url: `https://travel.betterbarmm.com/places/${p.slug}`,
}))
const venue = (v, kind) => ({
	id: `${kind}-${id(v.name + v.municipality)}`,
	name: v.name,
	kind: v.kind,
	area: v.area,
	municipality: v.municipality ?? null,
	address: v.address ?? null,
	note: v.note ?? v.about ?? null,
	halal: v.halal ?? null,
	phone: v.phone ?? null,
	facebook: v.facebook ?? null,
	image: v.image ? { url: abs(TRAVEL, v.image.url), caption: v.image.caption ?? null, ...credit(v.image) } : null,
	lat: v.lat ?? null,
	lon: v.lon ?? null,
})
const stays = read('places/stays.json').stays.map((v) => venue(v, 'stay'))
const eats = read('places/eats.json').eats.map((v) => venue(v, 'eat'))

/* ---- Write, then the manifest: one line per file with when it changed and its newest ids. */
fs.mkdirSync(OUT, { recursive: true })
const files = { news, incidents, bills, acts, places: { places, stays, eats } }
const manifest = { generatedAt: new Date().toISOString(), files: {} }
for (const [name, body] of Object.entries(files)) {
	const json = JSON.stringify(body)
	fs.writeFileSync(path.join(OUT, `${name}.json`), json)
	const list = Array.isArray(body) ? body : body.places
	manifest.files[name] = { url: `/app/v1/${name}.json`, hash: id(json), count: list.length, latest: list.slice(0, 20).map((r) => r.id) }
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, '\t'))
console.log(`app feed: ${Object.entries(manifest.files).map(([k, v]) => `${k} ${v.count}`).join(', ')}`)
