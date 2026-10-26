import { MapTrifoldIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   The way into the map, in the band at the top of the page

   The map is a dialog, so the page opens on a door to it: a line of
   words and a button. The button is a plain link to `#map`; the dialog
   listens for the hash and opens, so nothing here needs to be a client
   component or share state with the map.
   ============================================================ */

export function AccidentOpener() {
	return (
		<div className='flex flex-wrap items-center justify-between gap-8'>
			<div className='max-w-[48rem]'>
				<p className='bb-label'>Interactive map</p>
				<h1 className='mt-2 text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]'>
					Every incident on one map, with the report behind each mark.
				</h1>
				<p className='mt-3 text-[0.96875rem] leading-[1.65] text-[var(--ink-2)]'>
					Heat for where it keeps happening; dots coloured by kind and sized by deaths. Filters, details and each report down the left.
				</p>
			</div>
			<a href='#map' className='bb-btn bb-btn-solid !px-5 !py-3 !text-[0.65625rem]'>
				<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
				Open the map
			</a>
		</div>
	)
}
