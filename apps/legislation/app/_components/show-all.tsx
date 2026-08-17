import { Children, type ReactNode } from 'react'

type ShowAllProps = {
	children: ReactNode
	/** Rows visible before the reader asks for the rest. */
	initial?: number
	/** Plural noun for the button — "reports", "bills". */
	noun: string
	/** Element wrapping the rows. Use `ul` when the children are `li`. */
	as?: 'div' | 'ul'
}

/**
 * Caps a long list at `initial` rows and folds the remainder behind a quiet
 * button. Built on `<details>` rather than state so the whole list ships in
 * the HTML — readable without JavaScript, and crawlable.
 *
 * The rows below the fold sit in a second wrapper, because `<summary>` has to
 * be the first child of its `<details>` and cannot sit mid-list.
 */
export function ShowAll({ children, initial = 8, noun, as: Wrapper = 'div' }: ShowAllProps) {
	const rows = Children.toArray(children)

	if (rows.length <= initial) return <Wrapper>{rows}</Wrapper>

	return (
		<>
			<Wrapper>{rows.slice(0, initial)}</Wrapper>
			{/* A flex column so the button can centre itself with `self-center`.
			    `.btn` sits outside Tailwind's layers, so a utility cannot override
			    its `inline-flex` — and `mx-auto` does not centre an inline box. */}
			<details className='group flex flex-col'>
				{/* `.btn` alone, without `btn-quiet`: its border is already
				    transparent, so the control reads as text with a hit area. */}
				<summary className='btn mt-4 list-none self-center text-[var(--ink-2)] hover:text-[var(--ink)] group-open:hidden [&::-webkit-details-marker]:hidden'>
					Show all {rows.length} {noun}
					<svg
						className='size-3.5'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						aria-hidden='true'
					>
						<path d='m6 9 6 6 6-6' />
					</svg>
				</summary>
				<Wrapper>{rows.slice(initial)}</Wrapper>
			</details>
		</>
	)
}
