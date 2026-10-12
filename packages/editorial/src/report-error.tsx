'use client'

import { FlagIcon } from '@phosphor-icons/react'

/* "Spotted an error on this page?" — opens the report form on the main site
   with this page's address filled in, so the editor sees where it was. */

export function ReportErrorLink({ className = '' }: { className?: string }) {
	return (
		<a
			href='https://betterbarmm.com/report'
			onClick={(e) => {
				e.preventDefault()
				window.location.href = `https://betterbarmm.com/report?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(document.title)}`
			}}
			className={`inline-flex items-center gap-2 ${className}`}
		>
			<FlagIcon size={14} weight='fill' aria-hidden='true' />
			Spotted an error on this page? Tell us
		</a>
	)
}
