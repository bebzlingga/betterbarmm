'use client'

import { useEffect, useState } from 'react'

export type SwitchTab = { key: string; label: string; count?: number | string; panel: React.ReactNode }

/**
 * One panel at a time, chosen by tab. The other panels stay in the page, hidden, so a link to anything inside them
 * still works: a hash naming a tab (#national) or naming something inside one (#area-basilan, #national-sss) opens
 * that tab and scrolls to it, on load and whenever the hash changes — the search band's jump links among them.
 * `underline` is the page's main row; `pills` a row inside a panel.
 */
export function SwitchTabs({
	tabs,
	label,
	look = 'underline',
	all,
	className = '',
}: {
	tabs: SwitchTab[]
	label: string
	look?: 'underline' | 'pills'
	/** A first tab that shows every panel at once, and is the one open by default. */
	all?: { label: string; count?: number | string }
	className?: string
}) {
	const ALL = '__all'
	const [active, setActive] = useState(all ? ALL : tabs[0]?.key)

	useEffect(() => {
		const open = () => {
			const id = decodeURIComponent(location.hash.slice(1))
			if (!id) return
			const tab = tabs.find((t) => t.key === id || document.getElementById(`tab-panel-${t.key}`)?.querySelector(`[id="${CSS.escape(id)}"]`))
			if (!tab) return
			// With every panel showing, the target is already on the page: scroll to it, keep them all.
			setActive((cur) => (cur === ALL ? ALL : tab.key))
			// After the panel is shown: scroll to what the hash names.
			requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
		}
		open()
		window.addEventListener('hashchange', open)
		return () => window.removeEventListener('hashchange', open)
	}, [tabs])

	return (
		<div className={className}>
			<div
				role='tablist'
				aria-label={label}
				className={
					look === 'underline'
						? 'flex overflow-x-auto border-b border-[var(--rule)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
						: 'flex flex-wrap gap-2'
				}
			>
				{[...(all ? [{ key: ALL, label: all.label, count: all.count, panel: null }] : []), ...tabs].map((t) => {
					const on = t.key === active
					return (
						<button
							key={t.key}
							type='button'
							role='tab'
							id={`tab-${t.key}`}
							aria-selected={on}
							aria-controls={t.key === ALL ? undefined : `tab-panel-${t.key}`}
							onClick={() => setActive(t.key)}
							className={
								look === 'underline'
									? `-mb-px inline-flex shrink-0 cursor-pointer items-baseline gap-2 border-b-[3px] px-1 py-4 pr-7 text-[1.0625rem] font-extrabold tracking-[-0.015em] transition ${
											on ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
										}`
									: `inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[0.8125rem] font-semibold leading-none transition ${
											on ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)]'
										}`
							}
						>
							{t.label}
							{t.count !== undefined ? (
								<span className={`num leading-none ${look === 'underline' ? 'text-[0.8125rem] font-semibold' : 'font-medium'} ${on ? (look === 'pills' ? 'opacity-70' : 'text-[var(--accent)]') : 'text-[var(--ink-mute)]'}`}>
									{t.count}
								</span>
							) : null}
						</button>
					)
				})}
			</div>
			{tabs.map((t) => (
				<div key={t.key} role='tabpanel' id={`tab-panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={active !== ALL && t.key !== active}>
					{t.panel}
				</div>
			))}
		</div>
	)
}
