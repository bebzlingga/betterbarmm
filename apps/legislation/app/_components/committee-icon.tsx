import type { Icon } from '@phosphor-icons/react'
import { createElement } from 'react'
import {
	BankIcon,
	BookOpenTextIcon,
	BridgeIcon,
	BuildingApartmentIcon,
	BuildingsIcon,
	BusIcon,
	CalculatorIcon,
	CoinsIcon,
	FirstAidKitIcon,
	FlaskIcon,
	GraduationCapIcon,
	HandHeartIcon,
	HandshakeIcon,
	HardHatIcon,
	HouseLineIcon,
	LeafIcon,
	MagnifyingGlassIcon,
	MosqueIcon,
	PencilLineIcon,
	PlantIcon,
	ScalesIcon,
	SealCheckIcon,
	ShieldCheckIcon,
	StorefrontIcon,
	UsersFourIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/dist/ssr'

/* What a committee covers, as a glyph (user decision: committees as cards with icons). Matched on the committee's
   name, first match wins; a committee none of these names gets the plain group of people. */
const GLYPHS: [RegExp, Icon][] = [
	[/finance|budget/i, CoinsIcon],
	[/trade|tourism/i, StorefrontIcon],
	[/agricultur|fisher/i, PlantIcon],
	[/labou?r/i, HardHatIcon],
	[/education/i, GraduationCapIcon],
	[/social services/i, HandHeartIcon],
	[/indigenous/i, UsersFourIcon],
	[/public order|safety/i, ShieldCheckIcon],
	[/health/i, FirstAidKitIcon],
	[/settlement/i, HouseLineIcon],
	[/transport/i, BusIcon],
	[/science/i, FlaskIcon],
	[/public works/i, BridgeIcon],
	[/local government/i, BuildingsIcon],
	[/environment/i, LeafIcon],
	[/justice/i, ScalesIcon],
	[/rules/i, BookOpenTextIcon],
	[/amendment/i, PencilLineIcon],
	[/accounts/i, CalculatorIcon],
	[/blue ribbon|good government|accountability/i, MagnifyingGlassIcon],
	[/ethics/i, SealCheckIcon],
	[/ways and means/i, BankIcon],
	[/marawi|rehabilitation/i, BuildingApartmentIcon],
	[/muslim|islamic|da.?wah/i, MosqueIcon],
	[/peace|unification/i, HandshakeIcon],
]

export const committeeGlyph = (name: string): Icon => GLYPHS.find(([re]) => re.test(name))?.[1] ?? UsersThreeIcon

/** The committee's glyph on a rounded tile in the accent's tint. */
export function CommitteeIcon({ name, className = 'size-12' }: { name: string; className?: string }) {
	return (
		<span aria-hidden='true' className={`grid shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] ${className}`}>
			{createElement(committeeGlyph(name), { size: 24, weight: 'duotone' })}
		</span>
	)
}
