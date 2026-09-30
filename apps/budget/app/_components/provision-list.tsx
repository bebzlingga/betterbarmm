import { peso, splitAmounts, type Provision } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'

/* ============================================================
   The rules attached to the money

   A special provision is the other half of an appropriation and
   the half nobody publishes: not what an office was given, but
   what Parliament required it to do with it — who it must reach,
   what it may not be spent on, what has to be reported and to
   whom, and by when.

   Quoted in full rather than summarised. These are short, they
   are the operative text, and a paraphrase of a rule is a
   different rule. Where a provision names its own figure, that
   figure is a slice of the office's appropriation rather than
   money on top of it, so it is labeled "of which" and never
   added to anything.

   The amounts inside the quote are set in bold (user decision),
   and only the amounts. The Act writes each one twice, spelled
   out and then in digits, and the digits are what a reader
   scanning a page of rules is looking for. Weight only — the
   words are not changed, reordered or dropped, so the rule
   still reads as enacted.
   ============================================================ */

/** The Act's own words, with its amounts picked out of them. */
function Quoted({ text }: { text: string }) {
	return (
		<>
			{splitAmounts(text).map((part, index) =>
				part.amount ? (
					<strong key={index} className='money font-semibold text-[var(--ink)]'>
						{part.text}
					</strong>
				) : (
					<span key={index}>{part.text}</span>
				),
			)}
		</>
	)
}

export function ProvisionList({
	provisions,
	showOffice = false,
}: {
	provisions: Provision[]
	/** On a sector page these come from many offices, so each says which. */
	showOffice?: boolean
}) {
	return (
		<div>
			{provisions.map((provision) => (
				<article
					key={provision.id}
					id={provision.id}
					/* `--rule`, not `--rule-soft`: every page that renders this list sets
					   it on the `--paper-2` band, and against a tinted ground the soft
					   hairline (#f1f1ee on #f7f7f5) had almost nothing to be seen
					   against. One step up is enough — these are boundaries between
					   quoted rules of the Act, not a ledger's ruling.

					   None above the first, which opens under a SectionHead that already
					   draws a brass line of its own. */
					className='scroll-mt-28 border-t border-[var(--rule)] py-7 first:border-t-0'
				>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
						{/* The office hangs off the title rather than on a line of its own
						    (user decision): a fund's rule is titled with the fund's own
						    name, so the two lines read as the same words printed twice. */}
						<h3 className='text-[15px] font-bold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
							{showOffice ? (
								<YearLink href={`/offices/${provision.officeSlug}`} className='rule-link'>
									{provision.title}
								</YearLink>
							) : (
								provision.title
							)}
						</h3>

						{provision.amount != null ? (
							<p className='money font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>
								of which {peso(provision.amount)}
							</p>
						) : null}
					</div>

					{/* No measure on this one: a provision is operative text quoted in
					    full, and the figure it names sits ranged right on the line above.
					    Held to 34em the quote ran down the left half of the page with the
					    amount it belongs to floating alone across the gutter. */}
					<p className='mt-3 text-[13.5px] leading-7 text-[var(--ink-2)]'>
						<Quoted text={provision.text} />
					</p>

					{/* Sub-items nest more than one level in a few sections. The depth
					    is carried on the row rather than built into nested lists: it is
					    all the indent needs, and the fifteen rows that go two deep do
					    not justify a tree the other four hundred would sit inside. */}
					{provision.items.length > 0 ? (
						<ul className='mt-4'>
							{provision.items.map((item) => (
								<li
									key={item.id}
									className='flex gap-3 py-1 text-[13px] leading-6 text-[var(--ink-2)]'
									style={{ paddingInlineStart: `${item.depth * 1.15}rem` }}
								>
									<span
										aria-hidden='true'
										className='mt-2 size-1.5 shrink-0 rotate-45 bg-[var(--brass)]'
									/>
									<span className='min-w-0'>
										<Quoted text={item.text} />
										{item.amount != null ? (
											<span className='money ml-2 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brass)]'>
												{peso(item.amount)}
											</span>
										) : null}
									</span>
								</li>
							))}
						</ul>
					) : null}
				</article>
			))}
		</div>
	)
}
