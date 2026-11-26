import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Brand, FeedNote, Go, Label, Pad, PageHead, Photo, Pills, Row, Screen, Search, Stats } from '@/components/ui'
import { ago, feed, fullSize, pretty } from '@/lib/feed'
import { isOn, prefs } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'

/* Home: the region today. The brand bar, a strip of counts, the page head, pill tabs with their counts, search,
   the lead story, and the rest as hairline rows. Incidents is a tab when Incident Watch is on. */

type Filter = 'all' | 'government' | 'media' | 'incidents'
const GOVERNMENT = ['Bangsamoro Government', 'Information Agency', 'News Agency', 'Ministry', 'Parliament', 'BARMM']
const isGov = (source: string | null) => GOVERNMENT.some((g) => (source ?? '').includes(g))

export default function Home() {
	const c = useColors()
	const { news, incidents, bills, updated } = feed.use()
	const off = prefs.workspacesOff.use()
	const showHero = prefs.showHero.use()
	const [filter, setFilter] = useState<Filter>('all')
	const [query, setQuery] = useState('')
	const q = query.trim().toLowerCase()

	const week = news.filter((s) => s.published && (updated ?? 0) - +new Date(s.published) < 7 * 864e5).length
	const stories = news.filter((s) => {
		const fits = filter === 'all' || (filter === 'government' && isGov(s.source)) || (filter === 'media' && !isGov(s.source))
		return fits && (!q || s.title.toLowerCase().includes(q) || (s.source ?? '').toLowerCase().includes(q))
	})
	const lead = showHero && !q ? stories.find((s) => s.image) : undefined
	const rest = stories.filter((s) => s !== lead).slice(0, 120)
	const shownIncidents = incidents.filter((i) => !q || i.title.toLowerCase().includes(q) || (i.municipality ?? '').toLowerCase().includes(q))

	const tabs: { id: Filter; label: string; count: number }[] = [
		{ id: 'all', label: 'All', count: news.length },
		{ id: 'government', label: 'Government', count: news.filter((s) => isGov(s.source)).length },
		{ id: 'media', label: 'Media', count: news.filter((s) => !isGov(s.source)).length },
	]
	if (isOn('incidents', off)) tabs.push({ id: 'incidents', label: 'Incidents', count: incidents.length })

	return (
		<Screen>
			<Brand />
			<PageHead title="Today" detail={new Date().toLocaleDateString('en-PH', { weekday: 'long', day: 'numeric', month: 'long' })} />
			<Stats items={[{ label: 'This week', value: week }, { label: 'Incidents', value: incidents.length }, { label: 'Bills', value: bills.length }]} />
			<View style={{ paddingTop: 14, gap: 6 }}>
				<Pills items={tabs} value={filter} onChange={setFilter} />
				<Search value={query} onChange={setQuery} placeholder={filter === 'incidents' ? 'Search incidents' : 'Search news'} />
			</View>

			<Pad>
				{filter === 'incidents' ? (
					shownIncidents.map((i) => (
						<Row key={i.id} label={i.kind ?? 'Incident'} labelColor={c.accent} title={i.title}
							facts={[pretty(i.date), i.municipality, i.deaths ? `${i.deaths} dead` : null, i.injured ? `${i.injured} hurt` : null]}
							right={<Go />} onPress={() => router.push({ pathname: '/incident/[id]', params: { id: i.id } })} />
					))
				) : (
					<>
						{lead ? (
							<Pressable onPress={() => router.push({ pathname: '/story/[id]', params: { id: lead.id } })}
								style={({ pressed }) => ({ paddingTop: 18, paddingBottom: 18, gap: 12, borderBottomWidth: 1, borderColor: c.line, opacity: pressed ? 0.75 : 1 })}>
								<Photo uri={fullSize(lead.image)} style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: 6 }} />
								<Label>{`Latest · ${lead.source ?? 'News'} · ${ago(lead.published)}`}</Label>
								<Text style={{ fontFamily: font.headMedium, fontSize: 22, lineHeight: 27, letterSpacing: -0.4, color: c.fg }}>{lead.title}</Text>
							</Pressable>
						) : null}
						{rest.map((s) => (
							<Row key={s.id} thumb={s.image} title={s.title} facts={[s.source, ago(s.published)]}
								onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })} />
						))}
					</>
				)}
			</Pad>
			<FeedNote />
		</Screen>
	)
}
