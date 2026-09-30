'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'fil'

/**
 * One string in both languages.
 *
 * A plain object rather than a key into a message catalog. A catalog is
 * the right shape when the same phrase appears on forty screens and a
 * translator works through it apart from the code; here the copy is written
 * once, sits beside the figures it explains, and is edited by whoever is
 * editing the page. Keys would put every edit in two files and let them drift
 * apart silently — which is the failure that matters, because a stale
 * translation reads as confidently as a fresh one.
 */
export type Text = { en: string; fil: string }

/** Several of them, for a list. */
export type Texts = { en: string[]; fil: string[] }

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
	lang: 'en',
	setLang: () => {},
})

const STORAGE = 'bb-lang'

/**
 * Whether the switch is offered at all.
 *
 * The Filipino copy is written and shipped; it is simply not reachable yet.
 * One flag rather than a deletion, because the translations are the expensive
 * part and they keep working the moment this is flipped.
 *
 * While it is false the stored choice is ignored as well as the switch hidden.
 * A reader who had already picked Filipino would otherwise be left in it with
 * nothing on the page to get back out.
 */
export const LANGUAGE_SWITCH = false

/**
 * Which language the explainer pages are being read in.
 *
 * Held in state and mirrored to `localStorage`, not to the URL. These pages are
 * prose rather than records — nobody links somebody else to the Filipino cut of
 * a definition the way they link to a figure — and a search param would push
 * every page carrying one out of static rendering, which is what happened to
 * the nav.
 *
 * It starts in English on the server and on the first client frame, then
 * switches if storage says otherwise. That order matters: reading storage
 * during render would give the server one answer and the browser another, and
 * React would throw the whole tree away and rebuild it.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [lang, setLangState] = useState<Lang>('en')

	useEffect(() => {
		if (!LANGUAGE_SWITCH) return
		try {
			const saved = window.localStorage.getItem(STORAGE)
			if (saved === 'fil' || saved === 'en') setLangState(saved)
		} catch {
			// Private windows and blocked site data throw on read. English stands.
		}
	}, [])

	const setLang = useCallback((next: Lang) => {
		setLangState(next)
		try {
			window.localStorage.setItem(STORAGE, next)
		} catch {
			// The choice still holds for this visit; it just will not be remembered.
		}
		document.documentElement.lang = next === 'fil' ? 'fil' : 'en'
	}, [])

	return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
	return useContext(LangContext)
}

/** The string in the language being read. */
export function say(text: Text, lang: Lang): string {
	return lang === 'fil' ? text.fil : text.en
}

/** The list in the language being read, falling back where one is untranslated. */
export function sayAll(texts: Texts | undefined, lang: Lang): string[] {
	if (!texts) return []
	const picked = lang === 'fil' ? texts.fil : texts.en
	return picked.length > 0 ? picked : texts.en
}

/**
 * One bilingual string, rendered in the language being read.
 *
 * For prose that sits in a server-rendered page — a standfirst, a caption —
 * where threading the language down as a prop would mean making the whole page
 * a client component for one paragraph.
 */
export function Say({ text }: { text: Text }) {
	const { lang } = useLang()
	return <>{say(text, lang)}</>
}

/**
 * The switch itself.
 *
 * Two words rather than a flag or a globe: a flag picks a country for a
 * language spoken in several, and a globe says "settings" and not "read this
 * in Filipino". The inactive one is still legible rather than greyed out,
 * because it is the thing a reader is looking for.
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
	const { lang, setLang } = useLang()

	if (!LANGUAGE_SWITCH) return null

	return (
		<div
			className={`inline-flex items-center gap-1 border border-[var(--rule)] p-0.5 ${className}`}
			role='group'
			aria-label='Language'
		>
			{(
				[
					['en', 'English'],
					['fil', 'Filipino'],
				] as const
			).map(([code, label]) => (
				<button
					key={code}
					type='button'
					onClick={() => setLang(code)}
					aria-pressed={lang === code}
					className='cursor-pointer px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition duration-200 aria-pressed:bg-[var(--accent)] aria-pressed:text-white hover:text-[var(--ink)] aria-pressed:hover:text-white'
				>
					{label}
				</button>
			))}
		</div>
	)
}
