import { DocToc, type TocItem } from './doc-toc'

/**
 * A page read like documentation: its summary, if it has one, in a light
 * panel across the top, then one column of text with "On this page" beside
 * it on a wide screen, folded above it on a phone.
 */
export function DocLayout({
	toc,
	summary,
	children,
}: {
	/** "On this page"; leave it off and the text takes the full width. */
	toc?: TocItem[]
	summary?: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<div className={`bb-container bb-section grid gap-12 ${toc ? 'lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16' : ''}`}>
			{summary ? (
				<p className={`bg-[var(--paper-2)] px-6 py-5 text-[0.9375rem] leading-7 text-[var(--ink-2)] sm:px-8 sm:py-6 ${toc ? 'lg:col-span-2' : ''}`}>
					{summary}
				</p>
			) : null}

			{toc ? (
			<details className='border border-[var(--rule)] bg-[var(--paper-2)] px-5 py-4 lg:hidden'>
				<summary className='cursor-pointer text-[0.875rem] font-semibold text-[var(--ink)]'>On this page</summary>
				<ol className='mt-3'>
					{toc.map((item) => (
						<li key={item.id}>
							<a href={`#${item.id}`} className={`block py-1 text-[0.84375rem] text-[var(--ink-2)] ${item.depth === 2 ? 'pl-4' : 'font-medium'}`}>
								{item.label}
							</a>
						</li>
					))}
				</ol>
			</details>
			) : null}

			{/* One text width for every Learn page: wide enough for its tables. */}
			<article className='min-w-0 max-w-[58rem]'>{children}</article>

			{toc ? (
			<aside className='hidden lg:block'>
				<div className='sticky top-[calc(var(--sticky-top)+2rem)] max-h-[calc(100vh-var(--sticky-top)-4rem)] overflow-y-auto transition-[top] duration-300'>
					<DocToc items={toc} />
				</div>
			</aside>
			) : null}
		</div>
	)
}
