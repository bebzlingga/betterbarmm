import type { Story } from './feed'
import { store } from './store'

/* Everything the reader chooses, kept on the phone. No account. */

export type Appearance = 'system' | 'light' | 'dark'
export type TopicId = 'news' | 'bills' | 'acts' | 'incidents'

export const prefs = {
	onboarded: store(false, 'onboarded'),
	/** Workspaces switched off (Workspaces in workspaces.ts). A new workspace arrives switched on. */
	workspacesOff: store<string[]>([], 'workspacesOff'),
	topics: store<TopicId[]>([], 'topics'),
	/** Per topic, the ids already seen, so only what is new is announced. */
	seen: store<Record<string, string[]>>({}, 'seen'),
	saved: store<Story[]>([], 'saved'),
	appearance: store<Appearance>('system', 'appearance'),
	textScale: store(1, 'textScale'),
	showHero: store(true, 'showHero'),
	showLaws: store(true, 'showLaws'),
	showStayEat: store(true, 'showStayEat'),
}

export const hydratePrefs = () => Promise.all(Object.values(prefs).map((p) => p.hydrate()))

export const isOn = (id: string, off: string[]) => !off.includes(id)

export function toggleSaved(story: Story) {
	prefs.saved.set((list) => (list.some((s) => s.id === story.id) ? list.filter((s) => s.id !== story.id) : [story, ...list]))
}
