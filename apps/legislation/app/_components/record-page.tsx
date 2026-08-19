import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CategorySlug } from '../_lib/categories'
import { getRecord } from '../_lib/legislation-data'
import { getMembersDataset } from '../_lib/members-data'
import { RecordArticle } from './record-article'

/**
 * The number in `/acts/65`, or `NaN` for anything that is not one.
 *
 * Strict on purpose: `07` and `65.0` name the same measure as `7` and `65`,
 * and letting both through would put one record at two addresses. Only the
 * canonical form resolves, and `dynamicParams = false` 404s the rest before
 * this is ever reached.
 */
export function parseRecordNumber(raw: string): number {
	return /^\d+$/.test(raw) ? Number(raw) : Number.NaN
}

/**
 * Title and description for one measure's page.
 *
 * The description leads with the registry's own reading where there is one,
 * since that is the sentence worth showing in a search result or a link
 * preview, and falls back to the official title where there is not.
 */
export function recordMetadata(category: CategorySlug, raw: string): Metadata {
	const record = getRecord(category, parseRecordNumber(raw))

	if (!record) return { title: 'Measure not found' }

	const summary = record.citizenMeaning ?? record.gist ?? record.titleOfficial

	return {
		title: `${record.display} — ${record.shortTitle ?? record.title}`,
		description: `${record.display}. ${record.statusShort}, ${record.dateDisplay}. ${summary}`.slice(
			0,
			300,
		),
	}
}

/**
 * One measure's page.
 *
 * Shared by the four rolls that have records — acts, bills, and the two
 * resolution indexes — because the page is the same page each time: look the
 * measure up, 404 if the number names nothing, and hand it to the article.
 */
export function RecordPage({ category, number }: { category: CategorySlug; number: string }) {
	const record = getRecord(category, parseRecordNumber(number))

	if (!record) notFound()

	// Authors are written in roster form on every measure, so a lookup keyed
	// that way lets the article link each name to its profile.
	const memberSlugs = Object.fromEntries(
		getMembersDataset().members.map((member) => [member.rosterName.toUpperCase(), member.slug]),
	)

	return <RecordArticle record={record} memberSlugs={memberSlugs} />
}
