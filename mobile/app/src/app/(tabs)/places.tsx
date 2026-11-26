import { router } from 'expo-router'
import { useState } from 'react'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { Brand, FeedNote, Label, Pad, PageHead, Photo, Pills, Row, Screen, Search, Stats } from '@/components/ui'
import { areaName, feed, thumb, type Place, type Venue } from '@/lib/feed'
import { prefs } from '@/lib/prefs'
import { font, space, useColors } from '@/lib/theme'

/* Places: the region's islands, lakes, mosques and heritage. Shown the way Merdeka shows its issues — tall,
   lightly ringed covers with the name under them — a shelf per province. Stay and Eat are hairline rows. */

type Filter = 'all' | 'island' | 'beach' | 'lake' | 'falls' | 'mountain' | 'mosque' | 'heritage' | 'stay' | 'eat'

export default function Places() {
	const c = useColors()
	const { places } = feed.use()
	const stayEat = prefs.showStayEat.use()
	const [filter, setFilter] = useState<Filter>('all')
	const [query, setQuery] = useState('')
	const q = query.trim().toLowerCase()
	const hit = (name: string, municipality: string | null, area: string) => !q || [name, municipality ?? '', areaName(area)].some((s) => s.toLowerCase().includes(q))
	const count = (k: string) => places.places.filter((p) => p.kind === k).length

	const tabs: { id: Filter; label: string; count?: number }[] = [
		{ id: 'all', label: 'All', count: places.places.length }, { id: 'island', label: 'Islands', count: count('island') },
		{ id: 'beach', label: 'Beaches', count: count('beach') }, { id: 'lake', label: 'Lakes', count: count('lake') },
		{ id: 'falls', label: 'Falls', count: count('falls') }, { id: 'mountain', label: 'Mountains', count: count('mountain') },
		{ id: 'mosque', label: 'Mosques', count: count('mosque') }, { id: 'heritage', label: 'Heritage' },
	]
	if (stayEat) tabs.push({ id: 'stay', label: 'Stay', count: places.stays.length }, { id: 'eat', label: 'Eat', count: places.eats.length })

	const shown = places.places.filter((p) =>
		(filter === 'all' || p.kind === filter || (filter === 'heritage' && ['heritage', 'museum', 'memory'].includes(p.kind))) && hit(p.name, p.municipality, p.area),
	)
	const provinces = Object.entries(shown.reduce<Record<string, Place[]>>((acc, p) => ((acc[p.area] ??= []).push(p), acc), {}))
		.sort((a, b) => b[1].length - a[1].length)
	const islands = places.places.filter((p) => p.kind === 'island' && p.images.length)

	return (
		<Screen>
			<Brand />
			<PageHead title="Places" detail="Islands, lakes and heritage across the region" />
			<Stats items={[{ label: 'Places', value: places.places.length }, { label: 'Stays', value: places.stays.length }, { label: 'Eats', value: places.eats.length }]} />
			<View style={{ paddingTop: 14, gap: 6 }}>
				<Pills items={tabs} value={filter} onChange={setFilter} />
				<Search value={query} onChange={setQuery} placeholder="Search places, provinces, municipalities" />
			</View>

			{filter === 'stay' || filter === 'eat' ? (
				<Pad>{(filter === 'stay' ? places.stays : places.eats).filter((v) => hit(v.name, v.municipality, v.area)).map((v) => <VenueRow key={v.id} v={v} />)}</Pad>
			) : (
				<View style={{ paddingTop: 24, gap: 30 }}>
					{filter === 'all' && !q && islands.length ? <Shelf title="Islands to start with" places={islands} big /> : null}
					{provinces.map(([area, list]) => <Shelf key={area} title={`${areaName(area)} · ${list.length}`} places={list} />)}
					{!shown.length && places.places.length ? <Pad><Text style={{ fontFamily: font.body, color: c.dim }}>Nothing matches “{query}”.</Text></Pad> : null}
				</View>
			)}
			<FeedNote />
		</Screen>
	)
}

function Shelf({ title, places, big }: { title: string; places: Place[]; big?: boolean }) {
	const c = useColors()
	const w = big ? 220 : 148
	return (
		<View style={{ gap: 12 }}>
			<Pad><Label>{title}</Label></Pad>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.pad, gap: 14 }}>
				{places.map((p) => (
					<Pressable key={p.id} onPress={() => router.push({ pathname: '/place/[id]', params: { id: p.id } })} style={({ pressed }) => ({ width: w, gap: 10, opacity: pressed ? 0.75 : 1 })}>
						<Photo uri={thumb(p.images[0]?.url, big ? 960 : 500)} style={{ width: w, aspectRatio: 612 / 792, borderRadius: 4 }} />
						<View style={{ gap: 2 }}>
							<Text style={{ fontFamily: font.bodyMedium, fontSize: big ? 16 : 14, color: c.fg }} numberOfLines={1}>{p.name}</Text>
							<Text style={{ fontFamily: font.body, fontSize: 12, color: c.dim }} numberOfLines={1}>{p.kind} · {p.municipality ?? areaName(p.area)}</Text>
						</View>
					</Pressable>
				))}
			</ScrollView>
		</View>
	)
}

function VenueRow({ v }: { v: Venue }) {
	const c = useColors()
	const links = [
		v.phone ? { label: 'Call', url: `tel:${v.phone.replace(/[^\d+]/g, '')}` } : null,
		v.facebook ? { label: 'Facebook', url: v.facebook } : null,
		v.lat != null && v.lon != null ? { label: 'Map', url: `https://maps.google.com/?q=${v.lat},${v.lon}` } : null,
	].filter(Boolean) as { label: string; url: string }[]
	return (
		<Row thumb={v.image?.url ?? null} title={v.name} facts={[v.kind, v.halal === 'halal' ? 'Halal' : null, v.municipality ?? areaName(v.area)]}
			right={links.length ? (
				<View style={{ gap: 6, alignItems: 'flex-end' }}>
					{links.map((l) => (
						<Pressable key={l.label} onPress={() => Linking.openURL(l.url)} hitSlop={6}>
							<Text style={{ fontFamily: font.body, fontSize: 13, color: c.dim }}>{l.label}</Text>
						</Pressable>
					))}
				</View>
			) : undefined} />
	)
}
