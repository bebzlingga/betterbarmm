import type { MetadataRoute } from 'next'
import { listExplainers } from './_lib/explainers'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { SITE } from './_lib/seo'

/* Every page a search engine should find, with the published explainers
   read when the sitemap is built. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date()
	const page = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({
		url: `${SITE}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	})
	const explainers = await listExplainers().catch(() => [])
	return [
		page('', 1, 'daily'),
		page('/discover', 0.9),
		...discoverBarmmTopics.map((topic) => page(`/discover/${topic.slug}`, 0.8, 'monthly')),
		page('/accidents', 0.8, 'daily'),
		// Programs & services is hidden for now: back in when its link returns to the header.
		// The Directory is hidden for now, like Programs & services.
		page('/explainers', 0.8),
		...explainers.map((e) => ({ ...page(`/explainers/${e.slug}`, 0.7, 'monthly'), lastModified: new Date(e.updated_at ?? e.published_at ?? now) })),
		page('/about', 0.6, 'monthly'),
		page('/contribute', 0.6, 'monthly'),
		page('/jo', 0.4, 'monthly'),
	]
}
