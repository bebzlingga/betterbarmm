import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Share, Text, useWindowDimensions, View } from 'react-native'
import { Body, Detail, Sub } from '@/components/detail'
import { Button, Mini, Photo, openLink } from '@/components/ui'
import { areaName, feed, thumb } from '@/lib/feed'
import { font, useColors } from '@/lib/theme'

/* A place: its photographs (each with its credit — most are Creative Commons and require it), what it is, what
   to do, how to get there, when to go and what to know first. */

export default function PlaceScreen() {
	const c = useColors()
	const { width } = useWindowDimensions()
	const { id } = useLocalSearchParams<{ id: string }>()
	const p = feed.use().places.places.find((x) => x.id === id)
	const [page, setPage] = useState(0)
	if (!p) return <Detail title="This place isn’t in the feed." />
	const photo = p.images[page]

	const hero = p.images.length ? (
		<View>
			<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
				{p.images.map((img) => <Photo key={img.url} uri={thumb(img.url, 960)} ring={false} style={{ width, aspectRatio: 4 / 5 }} />)}
			</ScrollView>
			<View style={{ position: 'absolute', left: 22, right: 22, bottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
				<Text style={{ flex: 1, fontFamily: font.body, fontSize: 10, color: 'rgba(255,255,255,0.85)' }} numberOfLines={2}>
					{[photo?.author, photo?.license].filter(Boolean).join(' · ')}
				</Text>
				<View style={{ flexDirection: 'row', gap: 5 }}>
					{p.images.map((_, i) => <View key={i} style={{ width: i === page ? 16 : 5, height: 5, borderRadius: 3, backgroundColor: i === page ? '#fff' : 'rgba(255,255,255,0.45)' }} />)}
				</View>
			</View>
		</View>
	) : undefined

	return (
		<Detail hero={hero} label={`${p.kind} · ${p.municipality ?? ''}${p.municipality ? ', ' : ''}${areaName(p.area)}`} labelColor={c.accent} title={p.name}
			actions={<Mini icon="send" onPress={() => Share.share({ message: `${p.name}\n${p.url}` })} />}>
			{p.summary ? <Text style={{ fontFamily: font.headThin, fontSize: 22, lineHeight: 29, color: c.fg }}>{p.summary}</Text> : null}
			{p.detail.map((d) => <Body key={d} dim>{d}</Body>)}
			{p.do.length ? <Sub>What to do</Sub> : null}
			{p.do.map((d, i) => (
				<View key={d.title} style={{ flexDirection: 'row', gap: 12, paddingTop: i ? 12 : 0, borderTopWidth: i ? 1 : 0, borderColor: c.line }}>
					<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint, paddingTop: 3 }}>{String(i + 1).padStart(2, '0')}</Text>
					<View style={{ flex: 1, gap: 4 }}>
						<Text style={{ fontFamily: font.bodyMedium, fontSize: 16, color: c.fg }}>{d.title}</Text>
						{d.detail ? <Text style={{ fontFamily: font.body, fontSize: 14, lineHeight: 21, color: c.dim }}>{d.detail}</Text> : null}
					</View>
				</View>
			))}
			{p.gettingThere ? <><Sub>Getting there</Sub><Body dim>{p.gettingThere}</Body></> : null}
			{p.bestTime ? <><Sub>Best time</Sub><Body dim>{p.bestTime}</Body></> : null}
			{p.beforeYouGo.length ? <Sub>Before you go</Sub> : null}
			{p.beforeYouGo.map((n) => <Body key={n} dim>{`— ${n}`}</Body>)}
			<View style={{ paddingTop: 14 }}><Button arrow="→" title="More on BetterBARMM Travel" onPress={() => openLink(p.url)} /></View>
		</Detail>
	)
}
