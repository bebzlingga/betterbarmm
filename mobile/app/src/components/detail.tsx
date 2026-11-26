import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { font, useColors } from '@/lib/theme'
import { Label, Mini, Pad } from './ui'

/* The shell every detail page shares, in the admin's manner: small round outlined buttons (back on the left,
   actions on the right) floating over a scroll that may open on a photograph; then a tracked label, a medium
   title over a hairline, and the body. */

export function Detail({ hero, label, labelColor, title, children, actions }: {
	hero?: ReactNode; label?: string; labelColor?: string; title: string; children?: ReactNode; actions?: ReactNode
}) {
	const c = useColors()
	const insets = useSafeAreaInsets()
	const scale = 1
	return (
		<View style={{ flex: 1, backgroundColor: c.bg }}>
			<ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
				{hero ?? <View style={{ height: insets.top + 70 }} />}
				<Pad style={{ paddingTop: hero ? 26 : 8, gap: 16 }}>
					{label ? <Label color={labelColor}>{label}</Label> : null}
					<Text style={{ fontFamily: font.headMedium, fontSize: 28 * scale, lineHeight: 33 * scale, letterSpacing: -0.6, color: c.fg, paddingBottom: 16, borderBottomWidth: 1, borderColor: c.line }}>{title}</Text>
					{children}
				</Pad>
			</ScrollView>
			<View style={{ position: 'absolute', top: insets.top + 8, left: 22, right: 22, flexDirection: 'row', justifyContent: 'space-between' }}>
				<Mini icon="arrow-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
				<View style={{ flexDirection: 'row', gap: 10 }}>{actions}</View>
			</View>
		</View>
	)
}

/** A label and a value on a hairline. */
export function Fact({ label, value, first }: { label: string; value: string; first?: boolean }) {
	const c = useColors()
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 13, borderTopWidth: first ? 0 : 1, borderColor: c.line }}>
			<Text style={{ fontFamily: font.body, fontSize: 14, color: c.faint }}>{label}</Text>
			<Text style={{ flex: 1, textAlign: 'right', fontFamily: font.body, fontSize: 14, color: c.fg }}>{value}</Text>
		</View>
	)
}

/** Body text, sized by the reader's story-text setting. */
export function Body({ children, dim, scale = 1 }: { children: ReactNode; dim?: boolean; scale?: number }) {
	const c = useColors()
	return <Text style={{ fontFamily: font.body, fontSize: 17 * scale, lineHeight: 27 * scale, color: dim ? c.dim : c.fg }}>{children}</Text>
}

export function Sub({ children }: { children: ReactNode }) {
	const c = useColors()
	return <Text style={{ fontFamily: font.headMedium, fontSize: 20, color: c.fg, paddingTop: 14 }}>{children}</Text>
}
