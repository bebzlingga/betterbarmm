'use server'

import { createPublicClient } from '@betterbarmm/db'

export type ReportState = { ok: boolean; error: string | null }

/** File a reader's error report. The table accepts new reports from anyone and shows them to editors only. */
export async function fileReport(_prev: ReportState, form: FormData): Promise<ReportState> {
	// A field people never see: bots fill it in.
	if (String(form.get('website') ?? '')) return { ok: true, error: null }
	// Faster than a person can read and type: a bot.
	if (Date.now() - Number(form.get('started') ?? 0) < 3000) return { ok: true, error: null }

	const page = String(form.get('url') ?? '').trim().slice(0, 500)
	const message = String(form.get('message') ?? '').trim()
	const contact = String(form.get('contact') ?? '').trim().slice(0, 200) || null
	if (!/^https?:\/\/([a-z0-9-]+\.)*betterbarmm\.com(\/|$)/i.test(page)) return { ok: false, error: 'Paste the address of the BetterBARMM page with the error.' }
	if (message.length < 10) return { ok: false, error: 'Say a little more about what is wrong, and what it should be.' }
	if (message.length > 4000) return { ok: false, error: 'Please keep it under 4,000 characters.' }

	const db = createPublicClient()
	if (!db) return { ok: false, error: 'Reports are not switched on yet. Email support@betterbarmm.com instead.' }
	const { error } = await db.from('reports').insert({ page_url: page, message, contact })
	if (error) return { ok: false, error: 'It could not be saved just now. Email support@betterbarmm.com instead.' }
	return { ok: true, error: null }
}
