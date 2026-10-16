'use client'

import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

/* The estate's filter controls — a labelled select and a search field —
   so every explorer, in whichever workspace, filters with the same two
   boxes. Moved here from the procurement app, which drew them first. */

/** The box: a hairline and a tinted ground, or — `plain` — nothing until it is hovered or focused. */
const box = (plain: boolean) =>
	plain ? 'border border-transparent bg-transparent hover:border-[var(--rule)] focus:border-[var(--ink)]' : 'border border-[var(--rule)] bg-[var(--paper-2)] hover:border-[var(--ink)] focus:border-[var(--ink)]'

export function Select({
	label,
	value,
	options,
	onChange,
	plain = false,
}: {
	label: string
	value: string
	options: [string, string][]
	onChange: (value: string) => void
	/** No border or ground until hovered, the label beside the box rather than over it — a row of controls in a header rather than a form. */
	plain?: boolean
}) {
	return (
		<label className={plain ? 'flex min-w-0 items-center gap-2' : 'flex min-w-0 flex-col gap-1'}>
			<span className={`whitespace-nowrap text-[var(--ink-3)] ${plain ? 'text-[14px]' : 'text-[12px]'}`}>{label}</span>
			{/* The browser's own arrow sits against the edge and differs per
			    browser; this one is the site's, inset like the search icon. */}
			<span className='relative min-w-0 flex-1'>
				<select
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className={`h-10 w-full min-w-0 cursor-pointer appearance-none truncate pl-3 pr-9 text-[14px] text-[var(--ink)] outline-none transition ${box(plain)}`}
				>
					{options.map(([key, text]) => (
						<option key={key} value={key}>
							{text}
						</option>
					))}
				</select>
				<CaretDownIcon
					size={11}
					weight='bold'
					aria-hidden='true'
					className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]'
				/>
			</span>
		</label>
	)
}

/** The search field every explorer here opens with. */
export function SearchField({
	value,
	onChange,
	placeholder,
	plain = false,
}: {
	value: string
	onChange: (value: string) => void
	placeholder: string
	plain?: boolean
}) {
	return (
		<label className='flex w-full min-w-0 flex-col gap-1'>
			<span className={plain ? 'sr-only' : 'text-[12px] text-[var(--ink-3)]'}>Search</span>
			<span className={`flex h-10 items-center gap-3 px-3 focus-within:border-[var(--ink)] ${plain ? 'border border-transparent bg-transparent hover:border-[var(--rule)]' : 'border border-[var(--rule)] bg-[var(--paper-2)]'}`}>
				<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					type='search'
					autoComplete='off'
					spellCheck={false}
					placeholder={placeholder}
					className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
				/>
			</span>
		</label>
	)
}
