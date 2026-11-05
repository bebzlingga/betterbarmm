'use client'

import { CaretDownIcon } from '@phosphor-icons/react'

/* A select that submits its form as soon as it changes, so a filter needs no button. The browser's own arrow sits
   against the edge, so it is hidden and a caret drawn with room around it. */
export function AutoSelect({ className = '', ...props }: React.ComponentProps<'select'>) {
	return (
		<span className='relative inline-flex'>
			<select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} className={`appearance-none pr-10 ${className}`} />
			<CaretDownIcon size={14} weight='bold' aria-hidden className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]' />
		</span>
	)
}
