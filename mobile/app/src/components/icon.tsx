import {
	ArrowLeft, ArrowRight, ArrowUpRight, Bank, Bell, BookmarkSimple, Books, Buildings, ChartLineUp, Check, CheckSquare,
	Coins, Database, Drop, FileText, ForkKnife, GraduationCap, Handshake, House, Info, Island, Lifebuoy, MagnifyingGlass,
	MapPin, MapTrifold, Mosque, Mountains, Newspaper, PaperPlaneTilt, Phone, SealCheck, ShoppingCart, SquaresFour,
	TextAa, User, Warning, Waves, Yarn, Bed, Columns, Sun, Moon, Gear, type IconProps,
} from 'phosphor-react-native'

/* The flat icons: Phosphor, the set the websites use. The 3D ones (icons3d.ts) are the same glyphs, extruded. */

const ICONS = {
	'arrow-left': ArrowLeft, 'arrow-right': ArrowRight, 'arrow-up-right': ArrowUpRight, bank: Bank, bell: Bell,
	bookmark: BookmarkSimple, books: Books, buildings: Buildings, 'chart-line-up': ChartLineUp, check: Check,
	'check-square': CheckSquare, coins: Coins, database: Database, drop: Drop, 'file-text': FileText, 'fork-knife': ForkKnife,
	'graduation-cap': GraduationCap, handshake: Handshake, house: House, info: Info, island: Island, lifebuoy: Lifebuoy,
	search: MagnifyingGlass, 'map-pin': MapPin, 'map-trifold': MapTrifold, mosque: Mosque, mountains: Mountains,
	newspaper: Newspaper, send: PaperPlaneTilt, phone: Phone, 'seal-check': SealCheck, 'shopping-cart': ShoppingCart,
	squares: SquaresFour, 'text-aa': TextAa, user: User, warning: Warning, waves: Waves, yarn: Yarn, bed: Bed, columns: Columns, sun: Sun, moon: Moon, gear: Gear,
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, ...props }: { name: IconName | string } & IconProps) {
	const Glyph = ICONS[name as IconName] ?? Info
	return <Glyph {...props} />
}
