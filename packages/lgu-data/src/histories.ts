/* ============================================================
   Short histories of BARMM areas

   A few paragraphs per province or area for the top of its page:
   who lived there, the law that created it, how it came into the
   ARMM and then the BARMM. Each lists the sources it was written
   from. History only; the figures are the directory's.
   ============================================================ */

import file from '../../../datasets/lgu/histories.json'

export type AreaHistory = { paragraphs: string[]; sources: { label: string; href: string }[] }

const histories = file as unknown as { areas: Record<string, AreaHistory> }

/** The history of an area by its directory slug, or null. */
export function areaHistory(slug: string): AreaHistory | null {
	return histories.areas[slug] ?? null
}
