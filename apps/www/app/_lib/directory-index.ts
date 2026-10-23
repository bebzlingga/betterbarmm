import parliament from '../../../../datasets/bills/bangsamoro_registry/members/parliament-2026.json'
import type { DirectoryEntry } from '../_components/directory-search'
import { barangayRows, directoryOffices, localGovernments, memberId, nationalOffices } from './directory'
import { memberPortrait, nationalLogo, officeLogo, placeSeal } from './images'

/* The directory search's index: every office, province, town, barangay and Member of Parliament, with what each
   can be found by. Served as a static JSON file and fetched when the reader first types, so the page stays light. */

export type Member = { fullName: string; rosterName: string; seatLabel: string; district: string | null; sector: string | null; partyLabel: string | null; photo?: { file: string } | null }
export const members = parliament.members as Member[]

const fold = (...parts: (string | null | undefined)[]) =>
	parts
		.filter(Boolean)
		.join(' ')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()

/** Everything the search can find, built once on the server. */
export function searchIndex(): DirectoryEntry[] {
	const out: DirectoryEntry[] = []
	for (const o of directoryOffices)
		out.push({
			kind: 'Office',
			title: o.acronym ? `${o.name} (${o.acronym})` : o.name,
			sub: o.head ? `${o.head.name}, ${o.head.title}` : 'Head not named',
			href: `/directory/office/${o.slug}`,
			image: officeLogo(o.slug)?.src,
			terms: fold(o.name, o.acronym, o.head?.name, o.head?.title),
		})
	for (const o of nationalOffices)
		out.push({
			kind: 'National office',
			title: `${o.office} (${o.acronym})`,
			sub: o.for,
			href: `/directory/national/${o.slug}`,
			image: nationalLogo(o.slug)?.src,
			terms: fold(o.office, o.agency, o.acronym, o.for, o.head?.name),
		})
	for (const g of localGovernments) {
		out.push({
			kind: 'Province',
			title: g.name,
			sub: g.governor ? `Governor ${g.governor}` : `${g.units.length} towns`,
			href: g.href,
			image: placeSeal(g.slug)?.src,
			terms: fold(g.name, g.governor, g.viceGovernor),
		})
		for (const u of g.units) {
			// A barangay has no seal of its own here, so it takes its town's.
			const seal = placeSeal(g.slug, u.slug)?.src
			out.push({
				kind: 'Town',
				title: u.name,
				sub: [u.head ? `Mayor ${u.head}` : null, g.name].filter(Boolean).join(' · '),
				href: u.href,
				image: seal,
				terms: fold(u.name, u.head, u.deputy, g.name),
			})
			for (const b of barangayRows(g.slug, u.slug))
				out.push({
					kind: 'Barangay',
					title: `${b.name}, ${u.name}`,
					sub: [b.captain ? `Punong barangay ${b.captain}` : null, g.name].filter(Boolean).join(' · '),
					href: `${u.href}#barangays`,
					image: seal,
					terms: fold(b.name, b.captain, u.name),
				})
		}
	}
	for (const m of members)
		out.push({
			kind: 'Member of Parliament',
			title: m.fullName,
			sub: [m.district ?? m.sector ?? m.seatLabel, m.partyLabel].filter(Boolean).join(' · '),
			href: `/directory/parliament#${memberId(m)}`,
			image: memberPortrait(m)?.src,
			terms: fold(m.fullName, m.district, m.sector, m.partyLabel, m.seatLabel),
		})
	return out
}


