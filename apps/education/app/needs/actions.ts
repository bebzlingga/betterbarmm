'use server'

import { NEED_KINDS, NEED_POSTERS, createPublicClient } from '@betterbarmm/db'
import { schoolById } from '../_lib/education'
import { NEEDS_LIVE } from '../_lib/needs'

export type NeedState = { ok: boolean; error: string | null }

/** Post what a school needs. The table takes new posts from anyone; an editor approves each before it shows. */
export async function postNeed(_prev: NeedState, form: FormData): Promise<NeedState> {
	if (!NEEDS_LIVE) return { ok: false, error: 'Posting needs is closed for now.' }
	// A field people never see: bots fill it in.
	if (String(form.get('website') ?? '')) return { ok: true, error: null }
	// Faster than a person can read and type: a bot.
	if (Date.now() - Number(form.get('started') ?? 0) < 4000) return { ok: true, error: null }

	const school = schoolById.get(String(form.get('school') ?? ''))
	if (!school) return { ok: false, error: 'Choose the school first.' }
	const kind = String(form.get('kind') ?? '')
	if (!NEED_KINDS.some((k) => k.value === kind)) return { ok: false, error: 'Choose what the school needs.' }
	const poster = String(form.get('poster') ?? '')
	if (!NEED_POSTERS.some((p) => p.value === poster)) return { ok: false, error: 'Say who you are: a teacher, the school head, a student, a parent or someone in the community.' }
	const details = String(form.get('details') ?? '').trim()
	if (details.length < 20) return { ok: false, error: 'Say a little more: what is missing, and how it affects the learners.' }
	if (details.length > 2000) return { ok: false, error: 'Please keep it under 2,000 characters.' }
	// No title given: the first sentence of the details is one.
	const title = String(form.get('title') ?? '').trim() || details.split(/(?<=[.!?])\s|\n/)[0]!.slice(0, 120).trim()
	if (title.length < 5 || title.length > 120) return { ok: false, error: 'Give it a short title, between 5 and 120 characters.' }
	const raw = String(form.get('quantity') ?? '').trim()
	const quantity = raw ? Number(raw) : null
	if (quantity != null && !(Number.isInteger(quantity) && quantity >= 1 && quantity <= 100000)) return { ok: false, error: 'The number should be a whole number, like 3 or 120.' }
	const contact = String(form.get('contact') ?? '').trim().slice(0, 200) || null

	const db = createPublicClient()
	if (!db) return { ok: false, error: 'Posting is not switched on yet. Email support@betterbarmm.com with the school and what it needs.' }
	const { error } = await db.from('school_needs').insert({
		school_id: school.id,
		school_name: school.name,
		area: school.area,
		town: school.town,
		town_name: school.townName,
		kind,
		poster,
		title,
		details,
		quantity,
		contact,
	})
	if (error) return { ok: false, error: 'It could not be saved just now. Email support@betterbarmm.com with the school and what it needs.' }
	return { ok: true, error: null }
}
