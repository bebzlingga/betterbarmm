import { TableOfContents, type TocItem } from '@betterbarmm/editorial'

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
		<div className='bb-container pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2rem,4vw,3rem)]'>
			<div className='gap-x-14 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] xl:gap-x-20'>
				{/* The sections in turn (each a Reveal wrapping one section), every other one on a warm rounded panel, as the
				    travel look alternates its bands. */}
				<div className='grid min-w-0 grid-cols-1 gap-6 [&>*]:min-w-0 [&>*>section]:py-[clamp(3rem,5vw,4.5rem)] [&>:nth-child(even)>section]:rounded-[2rem] [&>:nth-child(even)>section]:bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] [&>:nth-child(even)>section]:bg-[image:radial-gradient(40rem_22rem_at_0%_0%,color-mix(in_srgb,#d4a72c_14%,transparent),transparent_70%),radial-gradient(44rem_24rem_at_100%_100%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_70%)] [&>:nth-child(even)>section]:px-[clamp(1.25rem,3.5vw,3rem)]'>
					{children}
				</div>

				{/* The same top padding a section carries, so the index label sits on the first kicker's line. */}
				<aside className='hidden lg:block lg:pt-[clamp(3rem,5vw,4.5rem)]'>
					<TableOfContents items={sections} />
				</aside>
			</div>
		</div>
	)
}
