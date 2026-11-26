import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { Outfit_200ExtraLight, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit'
import * as Notifications from 'expo-notifications'
import { useFonts } from 'expo-font'
import { router, Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import '@/lib/alerts' // defines the background task, which has to happen at module scope
import { loadCache, refresh } from '@/lib/feed'
import { hydratePrefs } from '@/lib/prefs'
import { useColors } from '@/lib/theme'

/* The root: fonts and the reader's settings load before anything draws (the splash stays up meanwhile), the
   cached feed shows at once and the network refreshes it, and a tapped notification opens its tab. */

SplashScreen.preventAutoHideAsync()

export default function Root() {
	const [fonts] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Outfit_200ExtraLight, Outfit_500Medium, Outfit_600SemiBold })
	const [ready, setReady] = useState(false)
	const c = useColors()
	const response = Notifications.useLastNotificationResponse()

	useEffect(() => {
		hydratePrefs().then(() => {
			setReady(true)
			loadCache().then(refresh)
		})
	}, [])

	useEffect(() => {
		if (fonts && ready) SplashScreen.hideAsync()
	}, [fonts, ready])

	useEffect(() => {
		const tab = response?.notification.request.content.data?.tab
		if (ready && typeof tab === 'string') router.navigate(tab as never)
	}, [response, ready])

	if (!fonts || !ready) return null
	return (
		<>
			<StatusBar style={c.bg === '#0f0f0f' ? 'light' : 'dark'} />
			<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'slide_from_right' }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
			</Stack>
		</>
	)
}
