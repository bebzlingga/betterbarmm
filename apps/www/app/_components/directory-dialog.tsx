import { OverlayDialog } from './overlay-dialog'

/** An office, a province, a town or the Parliament list, as a panel over the directory. */
export function DirectoryDialog({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
	return (
		<OverlayDialog
			id={id}
			name={name}
			home='/directory'
			frame='panel'
			className='bg-[var(--paper)] text-[var(--ink)] backdrop:bg-black/60'
			// On a small white disc, so the mark reads over the red masthead and the white page alike.
			closeClassName='rounded-full bg-white/95 text-[#191713] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)]'
		>
			{children}
		</OverlayDialog>
	)
}
