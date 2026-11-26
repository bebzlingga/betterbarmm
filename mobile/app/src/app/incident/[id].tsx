import { useLocalSearchParams } from 'expo-router'
import { Linking, Platform, Text, View } from 'react-native'
import { Body, Detail } from '@/components/detail'
import { Button } from '@/components/ui'
import { feed, pretty } from '@/lib/feed'
import { font, useColors } from '@/lib/theme'

/* An incident: what happened, where, the toll, and the spot on a map. */

export default function IncidentScreen() {
	const c = useColors()
	const { id } = useLocalSearchParams<{ id: string }>()
	const i = feed.use().incidents.find((x) => x.id === id)
	if (!i) return <Detail title="This incident has left the feed." />
	const place = [i.municipality, i.province].filter(Boolean).join(', ')
	const map = i.lat != null && i.lon != null
		? Platform.OS === 'ios' ? `https://maps.apple.com/?ll=${i.lat},${i.lon}&q=${encodeURIComponent(i.kind ?? 'Incident')}` : `geo:${i.lat},${i.lon}?q=${i.lat},${i.lon}`
		: null
	return (
		<Detail label={`${i.kind ?? 'Incident'} · ${pretty(i.date)}`} labelColor={c.accent} title={i.title}>
			{place ? <Text style={{ fontFamily: font.body, fontSize: 15, color: c.dim }}>{place}</Text> : null}
			{i.deaths || i.injured ? (
				<View style={{ flexDirection: 'row', gap: 34, paddingVertical: 6 }}>
					{i.deaths ? <Stat n={i.deaths} label="dead" color={c.accent} faint={c.faint} /> : null}
					{i.injured ? <Stat n={i.injured} label="hurt" color={c.accent} faint={c.faint} /> : null}
				</View>
			) : null}
			{i.summary ? <Body dim>{i.summary}</Body> : null}
			{map ? <View style={{ paddingTop: 10 }}><Button ghost arrow="↗" title="Open in Maps" onPress={() => Linking.openURL(map)} /></View> : null}
		</Detail>
	)
}

function Stat({ n, label, color, faint }: { n: number; label: string; color: string; faint: string }) {
	return (
		<View style={{ gap: 2 }}>
			<Text style={{ fontFamily: font.head, fontSize: 40, lineHeight: 44, color }}>{n}</Text>
			<Text style={{ fontFamily: font.body, fontSize: 13, color: faint }}>{label}</Text>
		</View>
	)
}
