import { Redirect, Tabs } from 'expo-router'
import { Icon } from '@/components/icon'
import { isOn, prefs } from '@/lib/prefs'
import { font, useColors } from '@/lib/theme'
import { WORKSPACES } from '@/lib/workspaces'

/* Five tabs, quiet: the ground colour, a hairline above, Phosphor icons that fill on the open tab. Parliament,
   Places and Explore follow the reader's workspaces; Home and You are always there. */

export default function TabsLayout() {
	const c = useColors()
	const onboarded = prefs.onboarded.use()
	const off = prefs.workspacesOff.use()
	if (!onboarded) return <Redirect href="/onboarding" />

	const explore = WORKSPACES.some((w) => !w.tab && isOn(w.id, off))

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: c.fg,
				tabBarInactiveTintColor: c.faint,
				tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.line, borderTopWidth: 1, elevation: 0 },
				tabBarLabelStyle: { fontFamily: font.bodyMedium, fontSize: 11 },
				sceneStyle: { backgroundColor: c.bg },
			}}>
			<Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="house" focused={focused} /> }} />
			<Tabs.Screen name="parliament" options={{ title: 'Parliament', tabBarIcon: ({ focused }) => <TabIcon name="bank" focused={focused} />, href: isOn('legislation', off) ? undefined : null }} />
			<Tabs.Screen name="places" options={{ title: 'Places', tabBarIcon: ({ focused }) => <TabIcon name="map-trifold" focused={focused} />, href: isOn('travel', off) ? undefined : null }} />
			<Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ focused }) => <TabIcon name="squares" focused={focused} />, href: explore ? undefined : null }} />
			<Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} /> }} />
		</Tabs>
	)
}

/** A tab's Phosphor icon, filled while its tab is open. */
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
	const c = useColors()
	return <Icon name={name} size={23} color={focused ? c.fg : c.faint} weight={focused ? 'fill' : 'regular'} />
}
