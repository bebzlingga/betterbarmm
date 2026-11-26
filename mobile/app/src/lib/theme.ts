import { useColorScheme } from 'react-native'
import { prefs } from './prefs'

/* The look, after Merdeka's admin (the Bangsamoro Information Office's magazine site): dark first, near-black and
   quiet, hairlines instead of boxes, three strengths of text, a faint tint for what is chosen, and a paper palette
   for light. The accent is BetterBARMM's crimson — lifted for dark, deep for paper — as the websites use it.

   Type: Outfit for headings and figures (medium titles, semibold numbers), DM Sans for everything read. */

const dark = {
	bg: '#0f0f0f',
	surface: '#181818',
	line: 'rgba(255,255,255,0.09)',
	fg: 'rgba(255,255,255,0.96)',
	dim: 'rgba(255,255,255,0.58)',
	faint: 'rgba(255,255,255,0.36)',
	accent: '#e8796a',
	gold: '#d8b062',
	tint: 'rgba(255,255,255,0.06)',
	tint2: 'rgba(255,255,255,0.10)',
	onFg: '#0f0f0f',
	icons: 'pearl' as 'pearl' | 'crimson',
}
const light: typeof dark = {
	bg: '#f5f3ed',
	surface: '#ffffff',
	line: 'rgba(12,20,16,0.12)',
	fg: 'rgba(12,20,16,0.94)',
	dim: 'rgba(12,20,16,0.64)',
	faint: 'rgba(12,20,16,0.5)',
	accent: '#8a2418',
	gold: '#8a6414',
	tint: 'rgba(12,20,16,0.04)',
	tint2: 'rgba(12,20,16,0.08)',
	onFg: '#f5f3ed',
	icons: 'crimson',
}
export type Colors = typeof dark

export function useColors(): Colors {
	const system = useColorScheme()
	const chosen = prefs.appearance.use()
	const mode = chosen === 'system' ? (system ?? 'dark') : chosen
	return mode === 'light' ? light : dark
}

export const font = {
	head: 'Outfit_600SemiBold',
	headMedium: 'Outfit_500Medium',
	headThin: 'Outfit_200ExtraLight',
	body: 'DMSans_400Regular',
	bodyMedium: 'DMSans_500Medium',
	bodyBold: 'DMSans_700Bold',
}

export const space = { pad: 22, gap: 14 }
