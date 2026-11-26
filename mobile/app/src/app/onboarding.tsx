import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Label, Mini, Pad, Row, Toggle } from '@/components/ui'
import { follow, TOPICS } from '@/lib/alerts'
import { isOn, prefs, type TopicId } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'
import { GROUPS, WORKSPACES } from '@/lib/workspaces'

/* The first launch, as spare as the admin's sign-in: the brand mark, a photograph, a medium title, three lines on
   what the app carries, one button. Then the workspaces and the topics, as the same hairline rows and switches
   the You tab uses, so a choice looks the same in both places. Each step scrolls, buttons at the end.
   "Set up again" opens it from the reader's current choices. */

export default function Onboarding() {
	const c = useColors()
	const insets = useSafeAreaInsets()
	const again = prefs.onboarded.get()
	const [step, setStep] = useState(0)
	const [workspaces, setWorkspaces] = useState<string[]>(
		again ? WORKSPACES.map((w) => w.id).filter((id) => isOn(id, prefs.workspacesOff.get())) : ['legislation', 'travel', 'incidents'],
	)
	const [topics, setTopics] = useState<TopicId[]>(again ? prefs.topics.get() : ['news', 'bills'])
	const toggle = <T,>(list: T[], x: T, on: boolean) => (on ? [...list, x] : list.filter((y) => y !== x))

	const finish = async (withTopics: TopicId[]) => {
		prefs.workspacesOff.set(WORKSPACES.map((w) => w.id).filter((id) => !workspaces.includes(id)))
		await follow(withTopics)
		prefs.onboarded.set(true)
		router.replace('/')
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30 }}>
			<Pad>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 40 }}>
					{step ? <Mini icon="arrow-left" label="Back" onPress={() => setStep(step - 1)} /> : <Mark />}
					{step ? <Text style={{ fontFamily: font.body, fontSize: 13, color: c.faint, fontVariant: ['tabular-nums'] }}>{step + 1} of 3</Text>
						: again ? <Pressable onPress={() => router.back()} hitSlop={8}><Text style={{ fontFamily: font.body, fontSize: 14, color: c.dim }}>Close</Text></Pressable> : null}
				</View>

				{step === 0 ? (
					<View style={{ paddingTop: 22, gap: 24 }}>
						<View style={{ gap: 8 }}>
							<WelcomePhoto />
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<Text style={{ fontFamily: font.body, fontSize: 11, color: c.faint }}>Sitangkai, Tawi-Tawi</Text>
								<Text style={{ fontFamily: font.body, fontSize: 11, color: c.faint }}>Photo: MimiAhid · CC0</Text>
							</View>
						</View>
						<Title title="The Bangsamoro, in plain view." detail="News, laws, public money and places across the region — every item traced to where it came from." />
						<View>
							{[
								{ icon: 'newspaper', title: 'News and incidents', detail: 'As they are reported, from every source' },
								{ icon: 'seal-check', title: 'Bills and laws', detail: 'Every measure, and the stage it has reached' },
								{ icon: 'island', title: 'Places to go', detail: 'Islands, lakes and heritage, with where to stay' },
							].map((f) => <Row key={f.icon} icon={f.icon} title={f.title} facts={[f.detail]} />)}
						</View>
						<View style={{ gap: 12 }}>
							<Button arrow="→" title="Get started" onPress={() => setStep(1)} />
							<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint, textAlign: 'center' }}>An independent public-information project. Not an official government app.</Text>
						</View>
					</View>
				) : step === 1 ? (
					<View style={{ paddingTop: 22, gap: 8 }}>
						<Title title="What should the app carry?" detail="Choose the workspaces you want. Change it any time in You." />
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
							<Text style={{ fontFamily: font.body, fontSize: 13, color: c.dim, fontVariant: ['tabular-nums'] }}>{workspaces.length} of {WORKSPACES.length} chosen</Text>
							<Pressable onPress={() => setWorkspaces(workspaces.length === WORKSPACES.length ? [] : WORKSPACES.map((w) => w.id))} hitSlop={8}>
								<Text style={{ fontFamily: font.bodyMedium, fontSize: 13, color: c.fg }}>{workspaces.length === WORKSPACES.length ? 'Clear' : 'Choose all'}</Text>
							</Pressable>
						</View>
						{GROUPS.map((g) => (
							<View key={g.id} style={{ paddingTop: 18 }}>
								<Label>{g.title}</Label>
								{WORKSPACES.filter((w) => w.group === g.id).map((w) => (
									<Row key={w.id} icon={w.icon} title={w.title} facts={[w.measure]}
										right={<Toggle value={workspaces.includes(w.id)} onChange={(v) => setWorkspaces(toggle(workspaces, w.id, v))} />} />
								))}
							</View>
						))}
						<View style={{ gap: 12, paddingTop: 22 }}>
							<Button arrow="→" title="Next" onPress={() => setStep(2)} />
							<Button ghost title="Skip" onPress={() => setStep(2)} />
						</View>
					</View>
				) : (
					<View style={{ paddingTop: 22, gap: 8 }}>
						<Title title="What should we tell you about?" detail="We check a few times a day and let you know when something new lands." />
						<View style={{ paddingTop: 6 }}>
							{TOPICS.map((t) => (
								<Row key={t.id} icon={t.icon} title={t.label} facts={[t.detail]}
									right={<Toggle value={topics.includes(t.id)} onChange={(v) => setTopics(toggle(topics, t.id, v))} />} />
							))}
						</View>
						<View style={{ gap: 12, paddingTop: 22 }}>
							<Button arrow="→" title={topics.length ? 'Finish' : 'Finish without alerts'} onPress={() => finish(topics)} />
							<Button ghost title="Not now" onPress={() => finish([])} />
						</View>
					</View>
				)}
			</Pad>
		</ScrollView>
	)
}

/** The welcome photograph, bundled so the first screen never waits on the network: a ringed cover, like the
    admin's issue thumbnails, only large. */
function WelcomePhoto() {
	const c = useColors()
	return (
		<View style={{ borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: c.line }}>
			{/* eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro bundles a static require */}
			<Image alt="Painted boats moored in a Sitangkai canal" source={require('../../assets/images/welcome.jpg')} style={{ width: '100%', aspectRatio: 4 / 3 }} contentFit="cover" />
		</View>
	)
}

function Title({ title, detail }: { title: string; detail: string }) {
	const c = useColors()
	return (
		<View style={{ gap: 6, paddingBottom: 18, borderBottomWidth: 1, borderColor: c.line }}>
			<Text style={{ fontFamily: font.headMedium, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: c.fg }}>{title}</Text>
			<Text style={{ fontFamily: font.body, fontSize: 14, lineHeight: 20, color: c.dim }}>{detail}</Text>
		</View>
	)
}

/** The brand mark: a circled letter and the name in spaced capitals. */
function Mark() {
	const c = useColors()
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
			<View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: c.fg, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ fontFamily: font.bodyMedium, fontSize: 11, color: c.fg }}>B</Text>
			</View>
			<Text style={{ fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 2.6, color: c.fg }}>BETTERBARMM</Text>
		</View>
	)
}
