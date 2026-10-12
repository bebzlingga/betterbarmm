/* ============================================================
   What the Commission on Audit found

   Annual Audit Report executive summaries for BARMM local governments,
   read from datasets/coa/audit-reports.json (built by
   datasets/coa/scripts/fetch_coa.py). coa.gov.ph turns away automated
   readers, so the reports are the ones the Internet Archive kept: mostly
   FY 2020, every one linked to COA's own address and to the archived copy
   that was read. Each is matched to the directory by its town's name.
   ============================================================ */

import file from '../../../datasets/coa/audit-reports.json'
import { lguProvinces } from './dataset'

export type AuditFinding = { text: string; amount: number | null; page: number | null }

export type AuditReport = {
	entity: string
	entityType: string
	area: string | null
	year: number
	opinion: string | null
	disallowances: number | null
	suspensions: number | null
	unliquidatedCashAdvances: number | null
	observations: number | null
	recommendations: number | null
	priorRecommendations: { total?: number | null; implemented: number | null; partial: number | null; notImplemented: number | null } | null
	findings: AuditFinding[]
	pdf: string
	archived?: string
	note?: string
	/** "area/town" in the LGU directory, where the town is in it. */
	unitKey: string | null
	/** The directory's own name for it. */
	unitName: string | null
}

const fold = (s: string) =>
	s
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/\b(municipality|city|of|the|then)\b/g, ' ')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()

const raw = file as unknown as { generatedAt: string; note: string; source: { label: string; href: string }[]; reports: Omit<AuditReport, 'unitKey' | 'unitName'>[]; gaps: unknown[] }

export const auditMeta = { generatedAt: raw.generatedAt, note: raw.note, source: raw.source, gaps: raw.gaps }

export const auditReports: AuditReport[] = raw.reports.map((r) => {
	const name = fold(r.entity.replace(/\(.*?\)/g, ''))
	const province = lguProvinces.find((p) => p.slug === r.area)
	// The exact name first; else the longest name it contains ("South Upi" before "Upi").
	const unit =
		province?.municipalities.find((m) => fold(m.name) === name) ??
		province?.municipalities.filter((m) => name.includes(fold(m.name))).sort((a, b) => b.name.length - a.name.length)[0]
	return { ...r, unitKey: unit ? `${province!.slug}/${unit.slug}` : null, unitName: unit?.name ?? null }
})

/** A town's reports, newest year first. */
export function auditsFor(unitKey: string): AuditReport[] {
	return auditReports.filter((r) => r.unitKey === unitKey).sort((a, b) => b.year - a.year)
}
