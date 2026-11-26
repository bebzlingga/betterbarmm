import { useLocalSearchParams } from 'expo-router'
import { Share, View } from 'react-native'
import { Body, Detail, Fact } from '@/components/detail'
import { Button, Mini, openLink } from '@/components/ui'
import { feed, pretty } from '@/lib/feed'
import { useColors } from '@/lib/theme'

/* A law: its title, what it is officially called, when it was enacted, and the act itself. */

export default function ActScreen() {
	const c = useColors()
	const { id } = useLocalSearchParams<{ id: string }>()
	const a = feed.use().acts.find((x) => x.id === id)
	if (!a) return <Detail title="This law isn’t in the feed." />
	const official = a.officialTitle ? a.officialTitle.charAt(0) + a.officialTitle.slice(1).toLowerCase() : null
	return (
		<Detail label={`Bangsamoro Autonomy Act No. ${a.number}`} labelColor={c.accent} title={a.title}
			actions={<Mini icon="send" onPress={() => Share.share({ message: `BAA ${a.number}: ${a.title}\n${a.url}` })} />}>
			{official ? <Body dim>{official}</Body> : null}
			<View style={{ paddingTop: 6 }}>
				{a.date ? <Fact first label="Enacted" value={pretty(a.date)} /> : null}
				{a.category ? <Fact first={!a.date} label="Subject" value={a.category} /> : null}
			</View>
			<View style={{ gap: 12, paddingTop: 10 }}>
				<Button arrow="→" title="Full record on BetterBARMM" onPress={() => openLink(a.url)} />
				{a.pdf ? <Button ghost title="Read the act (PDF)" arrow="↗" onPress={() => openLink(a.pdf!)} /> : null}
			</View>
		</Detail>
	)
}
