import { useLocalSearchParams } from 'expo-router'
import { Share, Text, View } from 'react-native'
import { Body, Detail, Fact } from '@/components/detail'
import { Button, Mini, openLink } from '@/components/ui'
import { feed, pretty } from '@/lib/feed'
import { font, useColors } from '@/lib/theme'

/* A bill: what it does, where it stands, and the full record on the legislation site. */

export default function BillScreen() {
	const c = useColors()
	const { id } = useLocalSearchParams<{ id: string }>()
	const b = feed.use().bills.find((x) => x.id === id)
	if (!b) return <Detail title="This bill isn’t in the feed." />
	return (
		<Detail label={`Bill No. ${b.number}`} labelColor={c.accent} title={b.title}
			actions={<Mini icon="send" onPress={() => Share.share({ message: `Bill ${b.number}: ${b.title}\n${b.url}` })} />}>
			{b.summary ? <Body dim>{b.summary}</Body> : null}
			<View style={{ paddingTop: 6 }}>
				<Fact first label="Where it stands" value={b.status ?? 'Filed'} />
				{b.asOf ? <Fact label="As of" value={pretty(b.asOf)} /> : null}
				{b.tags.length ? <Fact label="Subjects" value={b.tags.map((t) => t.replace(/_/g, ' ')).join(', ')} /> : null}
			</View>
			<View style={{ paddingTop: 10 }}><Button arrow="→" title="Full record on BetterBARMM" onPress={() => openLink(b.url)} /></View>
			<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint }}>Readings, committee referral, authors and the text, as Parliament published them.</Text>
		</Detail>
	)
}
