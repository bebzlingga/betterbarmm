import headPhotos from '../../../../datasets/directory/head-photos.json'
import logosFile from '../../../../datasets/directory/logos.json'
import officePhotos from '../../../../datasets/directory/office-photos.json'
import placePhotos from '../../../../datasets/directory/place-photos.json'
import { photo as discoverPhoto } from '../_components/discover-media'

/* ============================================================
   Every picture of a thing on the site, in one place

   Office logos, province and town seals, office heads' portraits,
   Members of Parliament's portraits, and the photographs of offices
   and places: each looked up here, with the credit its licence asks
   for, so every page that shows one shows the same one. `Emblem`
   (_components/emblem.tsx) draws a logo, seal or portrait, with
   initials where none has been found.
   ============================================================ */

/** An office's logo, or a province's or town's seal, served from this site, with the page it came from. */
export type Logo = { src: string; page: string; credit: string; license: string }
const logos = logosFile as { offices: Record<string, Logo>; national: Record<string, Logo>; areas: Record<string, Logo>; towns: Record<string, Logo> }
export const officeLogo = (slug: string) => logos.offices[slug] ?? null
/** A national agency's logo or seal, by its slug in national-offices.json. */
export const nationalLogo = (slug: string) => logos.national[slug] ?? null
/** A province's seal, or a town's (province and town slugs). */
export const placeSeal = (province: string, town?: string) => (town ? logos.towns[`${province}/${town}`] : logos.areas[province]) ?? null
/** An LGU's seal by its key, `province` or `province/town`, the key the services and the Directory both use. */
export const lguSeal = (key: string) => {
	const [province, town] = key.split('/')
	return placeSeal(province!, town)
}

/** An office head's official portrait, served from this site, with the page it came from. */
export type HeadPhoto = { src: string; page: string; credit: string }
export const headPhoto = (slug: string) => (headPhotos.heads as Record<string, HeadPhoto | undefined>)[slug] ?? null

/** A Member of Parliament's portrait, from the legislation workspace, which holds the Parliament's own. */
const LEGISLATION = 'https://legislation.betterbarmm.com'
export const memberPortrait = (m: { photo?: { file: string } | null }) => (m.photo ? { src: `${LEGISLATION}/images/members/elected/${m.photo.file}`, credit: 'Bangsamoro Parliament' } : null)

/** A Commons photograph of a place, credited as its licence asks. */
export type PlacePhoto = { url: string; page: string; author: string; license: string; caption: string; width: number; height: number }
const photos = placePhotos as { areas: Record<string, PlacePhoto | null>; towns: Record<string, PlacePhoto | null> }
/** A province's or area's photograph, or a town's (province and town slugs), if one has been found. */
export const placePhoto = (province: string, town?: string) => (town ? photos.towns[`${province}/${town}`] : photos.areas[province]) ?? null

/** A photograph of an office's building, with its credit: its own where one has been found, otherwise the
 *  Bangsamoro Government Center for an office in the compound, otherwise none.
 *  kind: a photograph of the building, or the office's emblem where no photograph of it is published. */
export type OfficePhoto = { src: string; page: string; credit: string; license: string; caption: string; kind?: 'photo' | 'emblem' }
const GOVERNMENT_CENTER = /government cent(er|re)|barmm compound|bangsamoro compound|barmm complex|office of the chief minister building|\bbgc\b|\bbcg\b/i
export function officePhoto(slug: string, address: string | null): OfficePhoto | null {
	const own = (officePhotos.offices as Record<string, OfficePhoto | undefined>)[slug]
	if (own) return own
	if (!address || !GOVERNMENT_CENTER.test(address)) return null
	// The compound's main building, the Office of the Chief Minister, by day.
	const center = discoverPhoto('chiefMinisterOffice')
	const caption = slug === 'office-of-the-chief-minister' ? 'The Office of the Chief Minister building, Cotabato City' : 'The Bangsamoro Government Center compound, Cotabato City: the Office of the Chief Minister building'
	return { src: center.src.src, page: center.source, credit: center.credit, license: center.license, caption }
}
