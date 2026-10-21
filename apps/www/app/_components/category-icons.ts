import {
	BankIcon,
	BooksIcon,
	BriefcaseIcon,
	CertificateIcon,
	CoinsIcon,
	FilesIcon,
	FirstAidKitIcon,
	GraduationCapIcon,
	HandCoinsIcon,
	HouseLineIcon,
	PlantIcon,
	ScalesIcon,
	StorefrontIcon,
	TruckIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'

/** One glyph per Programs & services category, keyed by its id in the datasets; the server build, so a page and the search can both draw it. */
export const CATEGORY_ICONS: Record<string, Icon> = {
	health: FirstAidKitIcon,
	assistance: HandCoinsIcon,
	education: GraduationCapIcon,
	livelihood: BriefcaseIcon,
	farming: PlantIcon,
	housing: HouseLineIcon,
	legal: ScalesIcon,
	business: StorefrontIcon,
	permits: CertificateIcon,
	requests: FilesIcon,
	taxes: CoinsIcon,
	community: BooksIcon,
	suppliers: TruckIcon,
	government: BankIcon,
}
