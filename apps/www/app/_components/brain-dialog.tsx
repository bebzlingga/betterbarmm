'use client'

import { XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { brain } from '../_lib/brain'
import { BrainMap } from './brain-map'

/* ============================================================
   The brain, over whatever page is open

   Opened by `#brain` in the address — a link anywhere, the nav, or
   a pasted URL — and closed by Escape, the close button or the back
   button. The map's data is fetched the first time it opens, so no
   page pays for it otherwise.

   A Next <Link> to "#brain" changes the address with pushState,
   which fires no hashchange, so clicks on such links are caught here
   and announced as one.
   ============================================================ */

type Data = ReturnType<typeof brain>
const HASH = '#brain'

const subscribe = (on: () => void) => {
	window.addEventListener('hashchange', on)
	window.addEventListener('popstate', on)
	return () => {
		window.removeEventListener('hashchange', on)
		window.removeEventListener('popstate', on)
	}
}
const announce = () => window.dispatchEvent(new HashChangeEvent('hashchange'))

export function BrainDialog() {
	const open = useSyncExternalStore(subscribe, () => window.location.hash === HASH, () => false)
	const [data, setData] = useState<Data | null>(null)
	const [failed, setFailed] = useState(false)
	const ref = useRef<HTMLDialogElement>(null)

	// Every link to #brain, wherever it is, opens the dialog in place.
	useEffect(() => {
		const click = (e: MouseEvent) => {
			const a = (e.target as HTMLElement | null)?.closest('a')
			if (!a || !a.getAttribute('href')?.endsWith(HASH) || e.metaKey || e.ctrlKey) return
			e.preventDefault()
			if (window.location.hash !== HASH) window.history.pushState(null, '', HASH)
			announce()
		}
		document.addEventListener('click', click, true)
		return () => document.removeEventListener('click', click, true)
	}, [])

	useEffect(() => {
		const d = ref.current
		if (!d) return
		if (open) {
			if (!d.open) {
				d.showModal()
				// A modal focuses its first control, the close button, which then wears a focus ring; focus the dialog instead.
				d.focus({ preventScroll: true })
			}
			document.documentElement.style.overflow = 'hidden'
			if (!data)
				fetch('/brain.json')
					.then((r) => r.json())
					.then(setData)
					.catch(() => setFailed(true))
		} else {
			if (d.open) d.close()
			document.documentElement.style.overflow = ''
		}
	}, [open, data])

	const close = () => {
		window.history.pushState(null, '', window.location.pathname + window.location.search)
		announce()
	}

	const datasets = data?.nodes.filter((n) => n.kind === 'dataset') ?? []
	return (
		<dialog
			ref={ref}
			aria-label='The brain of BetterBARMM'
			tabIndex={-1}
			onCancel={(e) => (e.preventDefault(), close())}
			className='fixed inset-0 m-0! h-dvh! max-h-none! w-full! max-w-none! overflow-hidden border-0! bg-[radial-gradient(ellipse_at_50%_40%,#3d0f18_0%,#1a0609_60%,#110406_100%)] p-0! text-white outline-none backdrop:bg-black/80'
		>
			<button type='button' onClick={close} aria-label='Close' className='fixed top-5 right-5 z-20 flex size-11 items-center justify-center text-white transition hover:opacity-70'>
				<XIcon size={26} weight='bold' aria-hidden='true' />
			</button>
			{/* From a laptop up the dialog is the screen: header on top, and the two columns fill the rest without the page scrolling. */}
			<div className='h-full overflow-y-auto overscroll-contain lg:flex lg:flex-col lg:overflow-hidden'>
				<header className='bb-container shrink-0 pt-8 pb-2 lg:pt-10'>
					<p className='font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#f1c453]'>How it all connects</p>
					<h2 className='mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-[-0.03em]'>The brain of BetterBARMM</h2>
					{data ? (
						<p className='mt-2 max-w-3xl text-[14px] leading-[1.6] text-white/70'>
							{data.nodes.filter((n) => n.kind === 'source').length} sources, {datasets.length} datasets and {data.nodes.filter((n) => n.kind === 'workspace').length} workspaces, holding{' '}
							{datasets.reduce((n, d) => n + (d.count ?? 0), 0).toLocaleString('en-PH')} records, joined by one code for every town and one ID for every office — and Jo, who answers from all of it. Every count here is read from the data itself.
						</p>
					) : null}
				</header>
				<div className='bb-container pb-10 lg:min-h-0 lg:flex-1 lg:pb-6'>
					{data ? (
						<BrainMap nodes={data.nodes} edges={data.edges} threads={data.threads} />
					) : (
						<p className='py-32 text-center text-[14px] text-white/60'>{failed ? 'The map did not load. Close this and try again.' : 'Drawing the map…'}</p>
					)}
				</div>
			</div>
		</dialog>
	)
}
