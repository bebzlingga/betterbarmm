import { useLocalSearchParams } from 'expo-router'
import { Share, Text, View } from 'react-native'
import { Body, Detail } from '@/components/detail'
import { Button, Mini, Photo, openLink } from '@/components/ui'
import { ago, feed, fullSize } from '@/lib/feed'
import { prefs, toggleSaved } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'

/* A story: its photograph, source and title, the summary, and the full report one tap away at its source. */

export default function StoryScreen() {
	const c = useColors()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { news } = feed.use()
	const saved = prefs.saved.use()
	const scale = prefs.textScale.use()
	const story = news.find((s) => s.id === id) ?? saved.find((s) => s.id === id)
	if (!story) return <Detail title="This story has left the feed." />
	const isSaved = saved.some((s) => s.id === story.id)
	const host = story.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]

	return (
		<Detail
			hero={story.image ? <Photo uri={fullSize(story.image)} ring={false} style={{ width: '100%', aspectRatio: 1 }} /> : undefined}
			label={`${story.source ?? 'News'} · ${ago(story.published)}`}
			labelColor={c.accent}
			title={story.title}
			actions={<>
				<Mini icon="bookmark" active={isSaved} onPress={() => toggleSaved(story)} />
				<Mini icon="send" onPress={() => Share.share({ message: `${story.title}\n${story.url}` })} />
			</>}>
			{story.summary ? <Body dim scale={scale}>{story.summary}</Body> : null}
			<View style={{ gap: 12, paddingTop: 12 }}>
				<Button arrow="→" title="Read the full story" onPress={() => openLink(story.url)} />
				<Button ghost title={isSaved ? 'Saved' : 'Save for later'} onPress={() => toggleSaved(story)} />
			</View>
			<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint }}>Opens at {host}. BetterBARMM links to the original report.</Text>
		</Detail>
	)
}
