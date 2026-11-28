import { OverlayDialog } from './overlay-dialog'

/** An office, a province, a town or the Parliament list, as a panel over the directory. */
export function DirectoryDialog({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
	return (
		<OverlayDialog
			id={id}
			name={name}
			home='/directory'
			frame='panel'
			// Tighter than a page: less space around each section, narrower sides, a smaller portrait and head's name. Rounded from a tablet up, the travel
			// look (user decision); the scroller inside clips to the same corners.
			className='bg-[var(--paper)] text-[var(--ink)] outline-none! backdrop:bg-black/60 [--bb-rhythm:3.25rem] md:rounded-[1.5rem]! md:[&>div]:rounded-[1.5rem] [&>div]:[scrollbar-width:thin] [&>div]:[scrollbar-color:rgb(0_0_0/0.28)_transparent] [&_.bb-section]:pt-16! md:[&_.bb-section]:pt-20! [&_.bb-container]:px-6! md:[&_.bb-container]:px-10! lg:[&_.bb-container]:px-12! [&_.size-24]:size-20! sm:[&_.size-28]:size-20! [&_p.text-\[1\.5rem\]]:text-[1.25rem]! [&_figure.bb-frame]:h-40! md:[&_figure.bb-frame]:h-48!'
			// On a small white disc, so the mark reads over the dark header and the white page alike.
			closeClassName='rounded-full bg-white/95 text-[#191713] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] md:bg-transparent md:text-white md:shadow-none'
		>
			{children}
		</OverlayDialog>
	)
}
