'use client'

import { useCallback, useState } from 'react'
import { statusToneClass } from '../_lib/labels'
import type { LegislationRecord } from '../_lib/legislation-data'
import { RecordDetail } from './record-detail'
import { ShowAll } from './show-all'

/* ============================================================
   What a committee was handed

   The committee pages list referrals as a line of capitals and a WordPress
   permalink — no number, no status, and a link that takes a reader off the
   site to a page with less on it than the record here. Every referral
   resolves to a record by title, so the row opens that record instead: the
   reader stays where they are, and gets the stage, the date, and the authors
   the source page never showed them.

   A referral that resolves to nothing keeps its outbound link. That happens
   for none of them today, and the fallback is here for the day the committee
   pages list something this registry has not indexed.
   ============================================================ */

export type Referral = {
	title: string
	url: string
	/** The registry record this refers to, matched on the published title. */
	record?: LegislationRecord
}

export function ReferralList({
	label,
	noun,
	items,
	memberSlugs,
}: {
	label: string
	noun: string
	items: Referral[]
	memberSlugs?: Record<string, string>
}) {
	const [selected, setSelected] = useState<LegislationRecord | null>(null)
	const closeRecord = useCallback(() => setSelected(null), [])

	if (items.length === 0) return null

	return (
		<div>
			<p className='label label-strong label-lg'>
				{label} <span className='num'>({items.length})</span>
			</p>

			<div className='mt-4'>
				<ShowAll as='ul' noun={noun}>
					{items.map((item, index) => (
						<li key={`${item.title}-${index}`} className='border-b border-[var(--rule-soft)]'>
							{item.record ? (
								<button
									type='button'
									onClick={() => setSelected(item.record ?? null)}
									className='row-in flex w-full cursor-pointer items-start gap-4 py-3.5 text-left'
								>
									<span className='min-w-0 flex-1'>
										<span className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
											<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
												{item.record.numberLabel}
											</span>
											<span className={statusToneClass[item.record.statusTone]}>
												{item.record.statusShort}
											</span>
										</span>
										<span className='mt-1 block text-[13px] leading-6 text-[var(--ink-2)]'>
											{item.record.title}
										</span>
									</span>
									<span className='meta-sm shrink-0 pt-0.5'>{item.record.dateDisplay}</span>
								</button>
							) : (
								<a
									href={item.url}
									target='_blank'
									rel='noreferrer'
									className='block py-3.5 text-[13px] leading-6 text-[var(--ink-2)] transition hover:text-[var(--ink)]'
								>
									{item.title}
								</a>
							)}
						</li>
					))}
				</ShowAll>
			</div>

			{selected ? (
				<RecordDetail record={selected} memberSlugs={memberSlugs} onClose={closeRecord} />
			) : null}
		</div>
	)
}
