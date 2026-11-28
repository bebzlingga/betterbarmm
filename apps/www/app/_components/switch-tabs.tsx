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
				className='seg'
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
							className='seg-tab'
						>
							{t.label}
							{t.count !== undefined ? (
								<span className='seg-count'>
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
