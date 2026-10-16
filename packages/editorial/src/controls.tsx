'use client'

import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

/* The estate's filter controls — a labelled select and a search field —
   so every explorer, in whichever workspace, filters with the same two
   boxes. Moved here from the procurement app, which drew them first. */

export function Select({
	label,
	value,
	options,
	onChange,
}: {
	label: string
	value: string
	options: [string, string][]
	onChange: (value: string) => void
}) {
	return (
		<label className='flex min-w-0 flex-col gap-1'>
			<span className='text-[12px] text-[var(--ink-3)]'>{label}</span>
			{/* The browser's own arrow sits against the edge and differs per
			    browser; this one is the site's, inset like the search icon. */}
			<span className='relative'>
				<select
					value={value}
					onChange={(event) => onChange(event.target.value)}
					className='h-10 w-full min-w-0 cursor-pointer appearance-none truncate border border-[var(--rule)] bg-[var(--paper-2)] pl-3 pr-9 text-[14px] text-[var(--ink)] outline-none transition hover:border-[var(--ink)] focus:border-[var(--ink)]'
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
}: {
	value: string
	onChange: (value: string) => void
	placeholder: string
}) {
	return (
		<label className='flex w-full min-w-0 flex-col gap-1'>
			<span className='text-[12px] text-[var(--ink-3)]'>Search</span>
			<span className='flex h-10 items-center gap-3 border border-[var(--rule)] bg-[var(--paper-2)] px-3 focus-within:border-[var(--ink)]'>
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
