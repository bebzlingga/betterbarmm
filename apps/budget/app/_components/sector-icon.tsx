import type { IconProps } from '@phosphor-icons/react'
import {
	BabyIcon,
	BankIcon,
	BowlFoodIcon,
	BriefcaseIcon,
	BuildingsIcon,
	BusIcon,
	CertificateIcon,
	ChalkboardTeacherIcon,
	ChartLineIcon,
	CoinsIcon,
	CraneTowerIcon,
	DesktopTowerIcon,
	DropIcon,
	FeatherIcon,
	FileTextIcon,
	FlaskIcon,
	GavelIcon,
	GraduationCapIcon,
	HammerIcon,
	HandHeartIcon,
	HeartbeatIcon,
	HouseLineIcon,
	MaskHappyIcon,
	MegaphoneIcon,
	MosqueIcon,
	PeaceIcon,
	PersonSimpleRunIcon,
	PlantIcon,
	ScalesIcon,
	SoccerBallIcon,
	StorefrontIcon,
	TentIcon,
	TreeIcon,
	UsersIcon,
	UsersThreeIcon,
	VaultIcon,
	WarningIcon,
	WheelchairIcon,
} from '@phosphor-icons/react/ssr'
// The component type lives on the package root; only the components themselves
// come from `/ssr`. A type import is erased, so this adds nothing to the bundle.
import type { Icon } from '@phosphor-icons/react'

/* ============================================================
   A mark per sector

   Thirty-eight sectors is more than a reader scans, and they
   arrive with one of them in mind — a roof, a clinic, a road.
   A mark gives the eye something to find the row by before it
   has read a word of it.

   Keyed by slug rather than by name: the name is prose from the
   taxonomy and will be reworded one day; the slug is the address
   and cannot be, because a link would break.

   Drawn as line art at one weight throughout. These sit beside
   figures, and a filled mark next to a peso amount reads as a
   status light — as though the sector were flagged rather than
   simply named.
   ============================================================ */

const ICONS: Record<string, Icon> = {
	education: GraduationCapIcon,
	'lump-sum-special-purpose-fund': VaultIcon,
	infrastructure: HammerIcon,
	health: HeartbeatIcon,
	'social-protection-welfare': HandHeartIcon,
	'governance-public-administration': BankIcon,
	'local-government-support': BuildingsIcon,
	'disaster-risk-reduction-emergency-response': WarningIcon,
	'legislation-parliament': GavelIcon,
	'personnel-pensions-benefits': UsersThreeIcon,
	'islamic-affairs-religious-services': MosqueIcon,
	'senior-citizens-pwds': WheelchairIcon,
	'children-family': BabyIcon,
	'peace-security-conflict-resolution': PeaceIcon,
	'livelihood-employment': BriefcaseIcon,
	'agriculture-fisheries-agrarian-reform': PlantIcon,
	'scholarships-grants': CertificateIcon,
	'housing-human-settlements': HouseLineIcon,
	'capacity-building-training': ChalkboardTeacherIcon,
	'trade-investment-tourism': StorefrontIcon,
	'science-technology-innovation': FlaskIcon,
	youth: PersonSimpleRunIcon,
	transportation: BusIcon,
	// A crane rather than the buildings used for local government: rebuilding a
	// city is not the same sector as running one, and two rows sharing a glyph
	// is worse than either row having none.
	'marawi-rehabilitation': CraneTowerIcon,
	'environment-natural-resources-energy': TreeIcon,
	'public-financial-management-revenue': CoinsIcon,
	'planning-research-m-e': ChartLineIcon,
	'legal-justice-shari-ah': ScalesIcon,
	'digitalization-ict': DesktopTowerIcon,
	'nutrition-feeding': BowlFoodIcon,
	'women-gender': UsersIcon,
	'culture-heritage-history': MaskHappyIcon,
	sports: SoccerBallIcon,
	'water-sanitation-hygiene': DropIcon,
	'internally-displaced-persons-settlers': TentIcon,
	'communications-media-public-information': MegaphoneIcon,
	'indigenous-peoples': FeatherIcon,
	'administrative-provision': FileTextIcon,
}

/**
 * The mark for one sector.
 *
 * Decorative, and marked as such: the sector's name is beside it in every
 * place this is used, so a screen reader announcing the icon as well would say
 * everything twice. A sector with no mark of its own falls back to the
 * document — which is what an untagged line in an Act is.
 */
export function SectorIcon({
	slug,
	className = '',
	/* `light` everywhere the mark sits beside its own name — in a list, the word
	   carries the meaning and the glyph only has to be quiet. The chart has no
	   words under its columns, so there the mark is the label and `duotone`
	   gives it enough body to be read as one. */
	weight = 'light',
}: {
	slug: string
	className?: string
	weight?: IconProps['weight']
}) {
	const Mark = ICONS[slug] ?? FileTextIcon
	return <Mark className={className} weight={weight} aria-hidden='true' />
}
