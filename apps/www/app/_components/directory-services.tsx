import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { Service } from '../_lib/services'
import { ServiceCards } from './service-cards'

/* An office's or an LGU's Programs & services, inside its Directory dialog:
   the first few services as the services pages draw them, then the way to
   the rest; or, with no charter read, why, and the way to its services page.
   The Directory says who runs a place and how to reach it; this says what
   it gives the public, so neither page has to be left to learn the other. */

const SHOWN = 8

export function DirectoryServices({ services, href, base, note }: { services: Service[]; href: string; base: string; note: string }) {
	return (
		<section aria-labelledby='services' className='mt-14'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 id='services' className='text-[20px] font-extrabold'>
					Programs & services {services.length ? <span className='text-[var(--ink-mute)]'>{services.length}</span> : null}
				</h2>
				<Link href={href} className='inline-flex items-center gap-1.5 text-[13.5px] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
					{services.length > SHOWN ? `All ${services.length}` : 'Its services page'} <ArrowRightIcon size={12} weight='bold' aria-hidden='true' />
				</Link>
			</div>
			<p className='mt-1 text-[13px] text-[var(--ink-3)]'>{note}</p>
			{services.length ? (
				<>
					<ServiceCards services={services.slice(0, SHOWN)} base={base} />
					{services.length > SHOWN ? (
						<p className='mt-4 text-right'>
							<Link href={href} className='inline-flex items-center gap-1.5 text-[14px] font-semibold underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
								{services.length - SHOWN} more, by category <ArrowRightIcon size={12} weight='bold' aria-hidden='true' />
							</Link>
						</p>
					) : null}
				</>
			) : null}
		</section>
	)
}
