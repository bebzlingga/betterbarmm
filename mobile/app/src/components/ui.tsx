import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import type { ReactNode } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { feed, refresh } from '@/lib/feed'
import { icon3d } from '@/lib/icons3d'
import { prefs } from '@/lib/prefs'
import { font, space, useColors } from '@/lib/theme'
import { Icon } from './icon'

/* The pieces every screen is built from, after Merdeka's admin: a brand bar (a circled letter and the name in
   spaced capitals), a page head (a medium title over a hairline, one pill action at the right), stat strips,
   pill tabs that take a faint tint when chosen, hairline list rows with a small ringed thumbnail, small accent
   switches, and a gold notice for the one thing worth interrupting for. Nothing is boxed that a hairline can
   separate instead. */

// ---- Page

/** A tab's page: the ground colour, the safe area, pull to refresh, room for the tab bar at the foot. */
export function Screen({ children, refreshable = true }: { children: ReactNode; refreshable?: boolean }) {
	const c = useColors()
	const insets = useSafeAreaInsets()
	const { loading } = feed.use()
	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: c.bg }}
			contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 }}
			keyboardDismissMode="on-drag"
			refreshControl={refreshable ? <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={c.dim} colors={[c.dim]} /> : undefined}>
			{children}
		</ScrollView>
	)
}

/** The page's own side padding. */
export function Pad({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
	return <View style={[{ paddingHorizontal: space.pad }, style]}>{children}</View>
}

/** The circled letter and the name in spaced capitals; the theme switch on the right, as the admin has it. */
export function Brand({ right }: { right?: ReactNode }) {
	const c = useColors()
	const appearance = prefs.appearance.use()
	const dark = c.bg === '#0f0f0f'
	return (
		<Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
				<View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: c.fg, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ fontFamily: font.bodyMedium, fontSize: 11, color: c.fg }}>B</Text>
				</View>
				<Text style={{ fontFamily: font.bodyBold, fontSize: 12, letterSpacing: 2.6, color: c.fg }}>BETTERBARMM</Text>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
				{right}
				<Mini icon={dark ? 'sun' : 'moon'} label={appearance === 'system' ? 'Theme' : undefined} onPress={() => prefs.appearance.set(dark ? 'light' : 'dark')} />
			</View>
		</Pad>
	)
}

/** A page's title row: a medium title, an optional pill action, a hairline under both. */
export function PageHead({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
	const c = useColors()
	return (
		<Pad>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 18, paddingBottom: 18, borderBottomWidth: 1, borderColor: c.line }}>
				<View style={{ flex: 1, gap: 4 }}>
					<Text style={{ fontFamily: font.headMedium, fontSize: 30, letterSpacing: -0.7, color: c.fg }}>{title}</Text>
					{detail ? <Text style={{ fontFamily: font.body, fontSize: 14, color: c.dim }}>{detail}</Text> : null}
				</View>
				{action}
			</View>
		</Pad>
	)
}

// ---- Type

/** Small, tracked, uppercase: a field's or a group's name. */
export function Label({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
	const c = useColors()
	return <Text style={[{ fontFamily: font.bodyMedium, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: color ?? c.faint }, style]}>{children}</Text>
}

// ---- Numbers

/** Figures side by side, split by hairlines: the admin's visitors-and-views strip. */
export function Stats({ items }: { items: { label: string; value: string | number }[] }) {
	const c = useColors()
	return (
		<Pad>
			<View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: c.line }}>
				{items.map((it, i) => (
					<View key={it.label} style={{ flex: 1, paddingVertical: 20, paddingLeft: i ? 16 : 0, borderLeftWidth: i ? 1 : 0, borderColor: c.line, gap: 8 }}>
						<Label color={c.dim}>{it.label}</Label>
						<Text style={{ fontFamily: font.head, fontSize: 30, letterSpacing: -0.8, color: c.fg, fontVariant: ['tabular-nums'] }}>{it.value}</Text>
					</View>
				))}
			</View>
		</Pad>
	)
}

// ---- Controls

/** Filled with the foreground colour, or a hairline ghost; always a pill. `small` is the page-head size. */
export function Button({ title, onPress, ghost, small, arrow }: { title: string; onPress: () => void; ghost?: boolean; small?: boolean; arrow?: string }) {
	const c = useColors()
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => ({
				flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
				height: small ? 38 : 50, paddingHorizontal: small ? 16 : 22, borderRadius: 99,
				backgroundColor: ghost ? 'transparent' : pressed ? c.accent : c.fg, borderWidth: ghost ? 1 : 0, borderColor: c.line, opacity: pressed && ghost ? 0.6 : 1,
			})}>
			<Text style={{ fontFamily: font.bodyMedium, fontSize: small ? 14 : 15, color: ghost ? c.fg : c.onFg }}>{title}</Text>
			{arrow ? <Text style={{ fontFamily: font.body, fontSize: 15, color: ghost ? c.dim : c.onFg }}>{arrow}</Text> : null}
		</Pressable>
	)
}

/** A round outlined button with a dim icon — back, share, the theme switch. */
export function Mini({ icon, onPress, active, label }: { icon: string; onPress: () => void; active?: boolean; label?: string }) {
	const c = useColors()
	return (
		<Pressable onPress={onPress} hitSlop={8} accessibilityLabel={label ?? icon}
			style={({ pressed }) => ({ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
			<Icon name={icon} size={16} color={active ? c.accent : c.dim} weight={active ? 'fill' : 'regular'} />
		</Pressable>
	)
}

/** Pill tabs: the chosen one takes a faint tint and full-strength text, the rest stay dim. */
export function Pills<T extends string>({ items, value, onChange }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (id: T) => void }) {
	const c = useColors()
	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.pad - 4, gap: 2 }}>
			{items.map((it) => {
				const on = it.id === value
				return (
					<Pressable key={it.id} onPress={() => onChange(it.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: on ? c.tint2 : 'transparent' }}>
						<Text style={{ fontFamily: on ? font.bodyMedium : font.body, fontSize: 14, color: on ? c.fg : c.dim }}>{it.label}</Text>
						{it.count != null ? <Text style={{ fontFamily: font.body, fontSize: 13, color: c.faint, fontVariant: ['tabular-nums'] }}>{it.count}</Text> : null}
					</Pressable>
				)
			})}
		</ScrollView>
	)
}

/** A field with no box, just a line underneath that brightens while you type. */
export function Search({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder: string }) {
	const c = useColors()
	return (
		<Pad>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: value ? c.dim : c.line }}>
				<Icon name="search" size={16} color={c.faint} />
				<TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={c.faint} autoCorrect={false} returnKeyType="search"
					style={{ flex: 1, fontFamily: font.body, fontSize: 15, color: c.fg, paddingVertical: 11 }} />
				{value ? <Pressable onPress={() => onChange('')} hitSlop={8}><Text style={{ fontFamily: font.body, fontSize: 13, color: c.faint }}>Clear</Text></Pressable> : null}
			</View>
		</Pad>
	)
}

/** The admin's switch: a short accent track, a knob in the ground colour. */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
	const c = useColors()
	return (
		<Pressable onPress={() => onChange(!value)} hitSlop={10} accessibilityRole="switch" accessibilityState={{ checked: value }}
			style={{ width: 38, height: 22, borderRadius: 11, padding: 2, backgroundColor: value ? c.accent : c.tint2, alignItems: value ? 'flex-end' : 'flex-start' }}>
			<View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c.bg }} />
		</Pressable>
	)
}

// ---- Rows

/** A hairline row: a small ringed thumbnail (photo or 3D icon) on the left, a medium title, a dim line of facts
    joined with " · ", and something quiet on the right — a switch, a count, an arrow. */
export function Row({ title, facts, thumb, icon, label, labelColor, right, onPress, tall }: {
	title: string; facts?: (string | null | undefined | false)[]; thumb?: string | null; icon?: string; label?: string; labelColor?: string
	right?: ReactNode; onPress?: () => void; tall?: boolean
}) {
	const c = useColors()
	const line = (facts ?? []).filter(Boolean).join(' · ')
	const body = (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderColor: c.line }}>
			{thumb !== undefined ? <Photo uri={thumb} style={{ width: 52, height: tall ? 68 : 52, borderRadius: 4 }} /> : null}
			{icon ? <Icon3D name={icon} size={44} /> : null}
			<View style={{ flex: 1, gap: 4 }}>
				{label ? <Label color={labelColor}>{label}</Label> : null}
				<Text style={{ fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 20, color: c.fg }} numberOfLines={2}>{title}</Text>
				{line ? <Text style={{ fontFamily: font.body, fontSize: 13, lineHeight: 18, color: c.dim }} numberOfLines={2}>{line}</Text> : null}
			</View>
			{right}
		</View>
	)
	return onPress ? <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>{body}</Pressable> : body
}

/** The quiet arrow at the end of a row that opens something. */
export function Go({ out }: { out?: boolean }) {
	const c = useColors()
	return <Text style={{ fontFamily: font.body, fontSize: 15, color: c.faint }}>{out ? '↗' : '→'}</Text>
}

/** A gold-edged note: offline, or something the reader must do. */
export function Notice({ children }: { children: ReactNode }) {
	const c = useColors()
	return (
		<Pad style={{ paddingTop: 16 }}>
			<View style={{ borderWidth: 1, borderColor: c.gold + '66', backgroundColor: c.gold + '1A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 }}>
				<Text style={{ fontFamily: font.body, fontSize: 13, lineHeight: 19, color: c.gold }}>{children}</Text>
			</View>
		</Pad>
	)
}

// ---- Media

/** Photos load with an honest User-Agent (Wikimedia asks clients for one), fade in, and keep a faint ring. */
export function Photo({ uri, style, ring = true }: { uri: string | null; style?: StyleProp<ViewStyle>; ring?: boolean }) {
	const c = useColors()
	const radius = (style as ViewStyle | undefined)?.borderRadius ?? 0
	return (
		<View style={[{ overflow: 'hidden', backgroundColor: c.tint }, style]}>
			{uri ? <Image alt="" source={{ uri, headers: { 'User-Agent': 'BetterBARMM-App/1.0 (https://betterbarmm.com)' } }} style={{ flex: 1 }} contentFit="cover" transition={200} cachePolicy="disk" /> : null}
			{ring ? <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: c.line, borderRadius: radius }} /> : null}
		</View>
	)
}

/** A 3D icon from the set, in the finish that suits the theme; `animated` plays its loop. */
export function Icon3D({ name, size = 56, animated }: { name: string; size?: number; animated?: boolean }) {
	const c = useColors()
	const source = icon3d(name, c.icons, animated)
	if (!source) return <Icon name={name} size={size * 0.55} color={c.accent} />
	return <Image alt="" source={source} style={{ width: size, height: size }} contentFit="contain" />
}

export const openLink = (url: string) => WebBrowser.openBrowserAsync(url)

/** Offline notice and the quiet line at the foot of every tab. */
export function FeedNote() {
	const c = useColors()
	const { updated, error } = feed.use()
	return (
		<>
			{error ? <Notice>{error}</Notice> : null}
			<Pad style={{ paddingTop: 26 }}>
				<Text style={{ fontFamily: font.body, fontSize: 12, color: c.faint }}>
					{updated ? `Updated ${new Date(updated).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })} · ` : ''}From betterbarmm.com, which links every item to its source.
				</Text>
			</Pad>
		</>
	)
}
