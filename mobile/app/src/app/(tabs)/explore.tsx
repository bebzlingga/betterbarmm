import { Text } from 'react-native'
import { Brand, Go, Label, Pad, PageHead, Row, Screen, openLink } from '@/components/ui'
import { isOn, prefs } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'
import { GROUPS, WORKSPACES } from '@/lib/workspaces'

/* Explore: the workspaces without a native screen, grouped as the website groups them, each opening in the app. */

export default function Explore() {
	const c = useColors()
	const off = prefs.workspacesOff.use()
	const shown = WORKSPACES.filter((w) => !w.tab && isOn(w.id, off))
	return (
		<Screen refreshable={false}>
			<Brand />
			<PageHead title="Explore" detail={`${shown.length} workspaces, opened in the app`} />
			{GROUPS.map((g) => {
				const list = shown.filter((w) => w.group === g.id)
				if (!list.length) return null
				return (
					<Pad key={g.id} style={{ paddingTop: 26 }}>
						<Label style={{ paddingBottom: 2 }}>{g.title}</Label>
						{list.map((w) => (
							<Row key={w.id} icon={w.icon} title={w.title} facts={[w.measure]} right={<Go out />} onPress={() => openLink(w.url)} />
						))}
					</Pad>
				)
			})}
			<Pad style={{ paddingTop: 24 }}>
				<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint }}>Switch workspaces on or off in You.</Text>
			</Pad>
		</Screen>
	)
}
