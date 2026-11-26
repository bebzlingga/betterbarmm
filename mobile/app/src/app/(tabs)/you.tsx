import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Brand, Button, Label, Pad, PageHead, Pills, Row, Screen, Toggle } from '@/components/ui'
import { check, follow, TOPICS } from '@/lib/alerts'
import { ago } from '@/lib/feed'
import { isOn, prefs, type Appearance } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'
import { GROUPS, WORKSPACES } from '@/lib/workspaces'

/* You: laid out like the admin's sidebar and settings — small capitals over each group, hairline rows, a switch
   or a count on the right. Saved stories, what to follow, the workspaces, what each screen shows, and the look. */

function Group({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
	return (
		<Pad style={{ paddingTop: 30 }}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 2 }}>
				<Label>{title}</Label>
				{action}
			</View>
			{children}
		</Pad>
	)
}

export default function You() {
	const c = useColors()
	const saved = prefs.saved.use()
	const topics = prefs.topics.use()
	const off = prefs.workspacesOff.use()
	const appearance = prefs.appearance.use()
	const scale = prefs.textScale.use()
	const showHero = prefs.showHero.use()
	const showLaws = prefs.showLaws.use()
	const showStayEat = prefs.showStayEat.use()
	const [result, setResult] = useState('')
	const on = WORKSPACES.filter((w) => isOn(w.id, off)).length

	return (
		<Screen refreshable={false}>
			<Brand />
			<PageHead title="You" detail="Everything here stays on your phone" action={<Button small ghost title="Set up again" onPress={() => router.push('/onboarding')} />} />

			<Group title={`Saved · ${saved.length}`}>
				{saved.length ? saved.map((s) => (
					<Row key={s.id} thumb={s.image} title={s.title} facts={[s.source, ago(s.published)]} onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })} />
				)) : (
					<Text style={{ fontFamily: font.body, fontSize: 14, color: c.dim, paddingVertical: 14, borderBottomWidth: 1, borderColor: c.line }}>
						Nothing saved yet. Tap the bookmark on a story to keep it here.
					</Text>
				)}
			</Group>

			<Group title="Follow" action={
				<Pressable onPress={async () => {
					const n = await check().catch(() => -1)
					setResult(n < 0 ? 'Couldn’t reach BetterBARMM.' : n === 0 ? 'Nothing new.' : `Sent ${n}.`)
				}} hitSlop={8}>
					<Text style={{ fontFamily: font.body, fontSize: 13, color: c.dim }}>{result || 'Check now'}</Text>
				</Pressable>
			}>
				{TOPICS.map((t) => (
					<Row key={t.id} icon={t.icon} title={t.label} facts={[t.detail]}
						right={<Toggle value={topics.includes(t.id)} onChange={(v) => follow(v ? [...topics, t.id] : topics.filter((x) => x !== t.id))} />} />
				))}
			</Group>

			<Group title={`Workspaces · ${on} of ${WORKSPACES.length}`}>
				{GROUPS.map((g) => WORKSPACES.filter((w) => w.group === g.id).map((w) => (
					<Row key={w.id} icon={w.icon} title={w.title} facts={[w.tab ? 'Its own tab' : 'Opens from Explore']}
						right={<Toggle value={isOn(w.id, off)} onChange={(v) => prefs.workspacesOff.set(v ? off.filter((x) => x !== w.id) : [...off, w.id])} />} />
				)))}
			</Group>

			<Group title="What to show">
				<Row title="Lead story" facts={['The large story at the top of Home']} right={<Toggle value={showHero} onChange={prefs.showHero.set} />} />
				<Row title="Newest laws" facts={['The row of laws on Parliament']} right={<Toggle value={showLaws} onChange={prefs.showLaws.set} />} />
				<Row title="Stay and eat" facts={['Tabs on Places']} right={<Toggle value={showStayEat} onChange={prefs.showStayEat.set} />} />
			</Group>

			<Group title="Display">
				<View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: c.line, marginHorizontal: -18 }}>
					<Pills<Appearance> items={[{ id: 'system', label: 'Automatic' }, { id: 'light', label: 'Paper' }, { id: 'dark', label: 'Night' }]} value={appearance} onChange={prefs.appearance.set} />
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: c.line }}>
					<Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: c.fg }}>Story text</Text>
					<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16 }}>
						{[0.9, 1, 1.15, 1.3].map((s) => (
							<Pressable key={s} onPress={() => prefs.textScale.set(s)} hitSlop={8}>
								<Text style={{ fontFamily: s === scale ? font.head : font.body, fontSize: 12 * s + 3, color: s === scale ? c.fg : c.faint }}>A</Text>
							</Pressable>
						))}
					</View>
				</View>
			</Group>

			<Pad style={{ paddingTop: 30 }}>
				<Text style={{ fontFamily: font.body, fontSize: 12, lineHeight: 18, color: c.faint }}>
					BetterBARMM is an independent public-information project, not an official government app. Everything here comes from betterbarmm.com, which links each item to its source.
				</Text>
			</Pad>
		</Screen>
	)
}
