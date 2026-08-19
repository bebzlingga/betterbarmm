/* ============================================================
   What a member's seat is provided

   Read from the Staffing Summary of the enacted General Appropriations Act of
   the Bangsamoro — BAA 85 for FY 2026, BAA 65 for the year before. Parliament
   publishes the figure, but only as one line of a 349-page budget, so nobody
   quotes it.

   It lives here rather than on either page that shows it, because both the hub
   and the member's-job page carry the same three numbers and a figure that
   appears twice will eventually disagree with itself.

   The caveat travels with the numbers for the same reason. This is the whole
   annual Personnel Services provision for the post — basic salary plus the
   bonuses, allowances and the government's share of contributions costed
   against it — and it is not take-home pay. The act does not split it per
   post, so neither does this.
   ============================================================ */

export type MemberPayFigure = {
	value: string
	label: string
	detail: string
}

export const MEMBER_PAY_FIGURES: MemberPayFigure[] = [
	{
		value: '₱3,277,082',
		label: 'Each member’s post, FY 2026',
		detail:
			'The same amount funds a Deputy Speaker, the Floor Leader and a Deputy Floor Leader. The office does not change the provision; only the Speaker’s does.',
	},
	{
		value: '₱3,635,096',
		label: 'The Speaker’s post, FY 2026',
		detail: '₱358,014 more than a member’s — about 11%.',
	},
	{
		value: '+3.7%',
		label: 'Change on FY 2025',
		detail:
			'A member’s post was provided ₱3,161,397 in the FY 2025 budget and ₱3,277,082 in FY 2026.',
	},
]

/**
 * The three figures, hairline-separated.
 *
 * `centred` is for the hub, where the surrounding block runs down the middle;
 * ranged left is the reading default everywhere else.
 */
export function MemberPayFigures({ centred = false }: { centred?: boolean }) {
	return (
		<dl
			className={
				centred
					? 'mx-auto grid max-w-4xl gap-x-10 gap-y-8 text-left sm:grid-cols-3'
					: 'grid gap-x-10 gap-y-8 sm:grid-cols-3'
			}
		>
			{MEMBER_PAY_FIGURES.map((figure) => (
				<div
					key={figure.label}
					className='border-t border-[var(--rule-soft)] pt-5 sm:border-t-0 sm:pt-0'
				>
					<dt className='label'>{figure.label}</dt>
					<dd>
						<p className='num mt-3 text-2xl font-black leading-none text-[var(--ink)]'>
							{figure.value}
						</p>
						<p className='mt-2.5 text-[13px] leading-5 text-[var(--ink-3)]'>{figure.detail}</p>
					</dd>
				</div>
			))}
		</dl>
	)
}
