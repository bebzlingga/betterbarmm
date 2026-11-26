import * as BackgroundTask from 'expo-background-task'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native'
import { fetchFile, feedUrl, type Act, type Bill, type Incident, type Manifest, type Story } from './feed'
import { prefs, type TopicId } from './prefs'

/* Subscriptions: a reader picks topics, and the app tells them when something new lands in one.

   No server. The OS wakes the app for a background task (iOS when it decides to, Android no more often than every
   15 minutes), the app reads the feed's manifest, compares each followed topic's newest ids with the ones it has
   seen, and posts a local notification for the difference. Real push — instant, and arriving even if the app has
   not been opened in weeks — is the upgrade: an APNs/FCM key and a job after each deploy. The manifest's ids are
   the ones that job would send, so topics and tap handling stay as they are.

   Imported once by the root layout: the task has to be defined at module scope. */

export const TOPICS: { id: TopicId; label: string; detail: string; icon: string; tab: string }[] = [
	{ id: 'news', label: 'News', detail: 'Stories about the region, from every source', icon: 'newspaper', tab: '/' },
	{ id: 'bills', label: 'Bills', detail: 'When a bill is filed or moves a stage', icon: 'file-text', tab: '/parliament' },
	{ id: 'acts', label: 'New laws', detail: 'When a Bangsamoro Autonomy Act is signed', icon: 'seal-check', tab: '/parliament' },
	{ id: 'incidents', label: 'Incidents', detail: 'Crashes, fires, floods and shootings', icon: 'warning', tab: '/' },
]

const TASK = 'betterbarmm-check'

Notifications.setNotificationHandler({
	handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
})

TaskManager.defineTask(TASK, async () => {
	try {
		await check()
		return BackgroundTask.BackgroundTaskResult.Success
	} catch {
		return BackgroundTask.BackgroundTaskResult.Failed
	}
})

async function manifest(): Promise<Manifest> {
	return (await fetch(feedUrl('manifest'))).json()
}

export async function requestPermission() {
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', { name: 'BetterBARMM', importance: Notifications.AndroidImportance.DEFAULT })
	}
	const now = await Notifications.getPermissionsAsync()
	if (now.granted) return true
	return (await Notifications.requestPermissionsAsync()).granted
}

/** Follow these topics. Everything already published is marked seen — following should not set off a flood. */
export async function follow(topics: TopicId[]) {
	if (topics.length) await requestPermission()
	const added = topics.filter((t) => !prefs.topics.get().includes(t))
	prefs.topics.set(topics)
	if (added.length) {
		try {
			const m = await manifest()
			prefs.seen.set((seen) => {
				const next = { ...seen }
				for (const t of added) next[t] = [...new Set([...(next[t] ?? []), ...(m.files[t]?.latest ?? [])])]
				return next
			})
		} catch {}
	}
	if (topics.length) await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 60 }).catch(() => {})
	else await BackgroundTask.unregisterTaskAsync(TASK).catch(() => {})
}

/** The whole check: what is new in each followed topic, announced. Returns how many notifications it posted. */
export async function check() {
	const topics = prefs.topics.get()
	if (!topics.length) return 0
	const m = await manifest()
	let posted = 0
	for (const topic of TOPICS.filter((t) => topics.includes(t.id))) {
		const latest = m.files[topic.id]?.latest ?? []
		const seen = new Set(prefs.seen.get()[topic.id] ?? [])
		const fresh = latest.filter((id) => !seen.has(id))
		prefs.seen.set((all) => ({ ...all, [topic.id]: [...new Set([...latest, ...(all[topic.id] ?? [])])].slice(0, 400) }))
		if (!fresh.length) continue
		const titles = await titlesFor(topic.id, new Set(fresh))
		await Notifications.scheduleNotificationAsync({
			content: {
				title: titles.length > 1 ? `${titles.length} new · ${topic.label}` : topic.label,
				body: (titles[0] ?? 'Open BetterBARMM to see what’s new.') + (titles.length > 1 ? `\n+ ${titles.length - 1} more` : ''),
				data: { tab: topic.tab },
			},
			trigger: null,
		})
		posted++
	}
	return posted
}

async function titlesFor(topic: TopicId, ids: Set<string>) {
	switch (topic) {
		case 'news': return (await fetchFile<Story[]>('news')).filter((s) => ids.has(s.id)).map((s) => s.title)
		case 'incidents': return (await fetchFile<Incident[]>('incidents')).filter((s) => ids.has(s.id)).map((s) => s.title)
		case 'bills': return (await fetchFile<Bill[]>('bills')).filter((b) => ids.has(b.id)).map((b) => `Bill ${b.number}: ${b.title}${b.status ? ` — ${b.status}` : ''}`)
		case 'acts': return (await fetchFile<Act[]>('acts')).filter((a) => ids.has(a.id)).map((a) => `BAA ${a.number}: ${a.title}`)
	}
}
