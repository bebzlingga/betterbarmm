import { TableOfContents, type TocItem } from './table-of-contents'

/**
 * The shape the three "How Parliament works" pages share: one reading column
 * ranged left, with a standing index in the margin beside it.
 *
 * The index is a margin note. Below `lg` there is no margin to put it in, and
 * a stack of jump links above the article would only delay the article, so it
 * drops out entirely rather than being restacked.
 */
export function ReadingColumn({
	sections,
	children,
}: {
	sections: TocItem[]
	children: React.ReactNode
}) {
	return (
		<div className='bb-container pb-20'>
			<div className='gap-x-16 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] xl:gap-x-24'>
				{/* Hairlines between the sections. Ranged left the headings no longer
				    have space either side to separate them, so the rules do it. */}
				<div className='min-w-0 divide-y divide-[var(--rule-soft)]'>{children}</div>

				{/* The same top padding a section carries, so the index label sits on
				    the first kicker's line. */}
				<aside className='hidden lg:block lg:pt-14'>
					<TableOfContents items={sections} />
				</aside>
			</div>
		</div>
	)
}
