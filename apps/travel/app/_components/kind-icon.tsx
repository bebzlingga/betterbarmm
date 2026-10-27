import {
	BankIcon,
	BuildingsIcon,
	ColumnsIcon,
	DropIcon,
	FlowerLotusIcon,
	IslandIcon,
	MosqueIcon,
	MountainsIcon,
	PlantIcon,
	StorefrontIcon,
	UmbrellaSimpleIcon,
	WavesIcon,
	YarnIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { ExploreKind } from '@betterbarmm/travel-data/explore'

/** One glyph per kind of place, for the category bar and the place page. The `ssr` build: it needs no context, so the server page and the client explorer can both draw it. */
export const KIND_ICON: Record<ExploreKind, Icon> = {
	island: IslandIcon,
	beach: UmbrellaSimpleIcon,
	mosque: MosqueIcon,
	lake: WavesIcon,
	falls: DropIcon,
	mountain: MountainsIcon,
	nature: PlantIcon,
	heritage: ColumnsIcon,
	museum: BankIcon,
	market: StorefrontIcon,
	craft: YarnIcon,
	memory: FlowerLotusIcon,
	city: BuildingsIcon,
}
