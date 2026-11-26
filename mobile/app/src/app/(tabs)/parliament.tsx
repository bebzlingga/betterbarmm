import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Brand, FeedNote, Go, Label, Pad, PageHead, Pills, Row, Screen, Search, Stats } from '@/components/ui'
import { feed, pretty, stageColor } from '@/lib/feed'
import { prefs } from '@/lib/prefs'
import { font, space, useColors } from '@/lib/theme'

/* Parliament: the bills on record with the stage each has reached, and the laws passed. Counts first, then the
   newest laws as a row of figures, then every bill as a hairline row. */

export default function Parliament() {
	const c = useColors()
	const { bills, acts } = feed.use()
	const showLaws = prefs.showLaws.use()
	const [tab, setTab] = useState<'bills' | 'laws'>('bills')
	const [query, setQuery] = useState('')
	const q = query.trim().toLowerCase()
	const match = (title: string, n: number, extra: string | null) => !q || title.toLowerCase().includes(q) || String(n) === q || (extra ?? '').toLowerCase().includes(q)
	const committee = bills.filter((b) => /committee/i.test(b.status ?? '')).length

	return (
		<Screen>
			<Brand />
			<PageHead title="Parliament" detail="Bills and laws of the Bangsamoro" />
			<Stats items={[{ label: 'Bills', value: bills.length }, { label: 'In committee', value: committee }, { label: 'Laws', value: acts.length }]} />
			<View style={{ paddingTop: 14, gap: 6 }}>
				<Pills items={[{ id: 'bills', label: 'Bills', count: bills.length }, { id: 'laws', label: 'Laws', count: acts.length }]} value={tab} onChange={setTab} />
				<Search value={query} onChange={setQuery} placeholder="Search by title or number" />
			</View>

			{tab === 'bills' && showLaws && !q && acts.length ? (
				<View style={{ paddingTop: 22, gap: 12 }}>
					<Pad><Label>Newest laws</Label></Pad>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.pad, gap: 10 }}>
						{acts.slice(0, 6).map((a) => (
							<Pressable key={a.id} onPress={() => router.push({ pathname: '/act/[id]', params: { id: a.id } })}
								style={({ pressed }) => ({ width: 200, padding: 16, gap: 18, borderRadius: 8, borderWidth: 1, borderColor: c.line, opacity: pressed ? 0.7 : 1 })}>
								<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
									<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint }}>BAA</Text>
									<Text style={{ fontFamily: font.head, fontSize: 30, color: c.fg, fontVariant: ['tabular-nums'] }}>{a.number}</Text>
								</View>
								<View style={{ gap: 4 }}>
									<Text style={{ fontFamily: font.bodyMedium, fontSize: 14, lineHeight: 19, color: c.fg }} numberOfLines={2}>{a.title}</Text>
									<Text style={{ fontFamily: font.body, fontSize: 12, color: c.dim }}>{pretty(a.date)}</Text>
								</View>
							</Pressable>
						))}
					</ScrollView>
				</View>
			) : null}

			<Pad style={{ paddingTop: tab === 'bills' && showLaws && !q ? 14 : 0 }}>
				{tab === 'bills'
					? bills.filter((b) => match(b.title, b.number, b.summary)).map((b) => (
						<Row key={b.id} label={`Bill ${b.number}`} labelColor={stageColor(b.status, c.accent, c.faint)} title={b.title}
							facts={[b.status ?? 'Filed', pretty(b.asOf)]} right={<Go />} onPress={() => router.push({ pathname: '/bill/[id]', params: { id: b.id } })} />
					))
					: acts.filter((a) => match(a.title, a.number, a.category)).map((a) => (
						<Row key={a.id} label={`BAA ${a.number}`} labelColor={c.accent} title={a.title}
							facts={[a.category, pretty(a.date)]} right={<Go />} onPress={() => router.push({ pathname: '/act/[id]', params: { id: a.id } })} />
					))}
			</Pad>
			<FeedNote />
		</Screen>
	)
}
