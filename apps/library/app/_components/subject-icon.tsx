import type { Icon } from '@phosphor-icons/react'
import {
	BabyIcon,
	BankIcon,
	BookBookmarkIcon,
	ChartLineUpIcon,
	FeatherIcon,
	FlagIcon,
	GenderFemaleIcon,
	GraduationCapIcon,
	HandshakeIcon,
	MosqueIcon,
	PaletteIcon,
	ScrollIcon,
	SwordIcon,
	TranslateIcon,
	UserCircleIcon,
	UsersThreeIcon,
	SquaresFourIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { books, subjects } from '../_lib/library'

/** A glyph for each shelf, as travel's categories have theirs. */
export const SUBJECT_ICON: Record<string, Icon> = {
	history: ScrollIcon,
	'colonial-period': FlagIcon,
	'peace-process': HandshakeIcon,
	conflict: SwordIcon,
	politics: BankIcon,
	culture: PaletteIcon,
	literature: FeatherIcon,
	religion: MosqueIcon,
	anthropology: UsersThreeIcon,
	economy: ChartLineUpIcon,
	memoir: UserCircleIcon,
	language: TranslateIcon,
	education: GraduationCapIcon,
	women: GenderFemaleIcon,
	children: BabyIcon,
	reference: BookBookmarkIcon,
}

/**
 * The shelves as a bar of glyphs under the header, as travel's categories sit under its search: each opens the books
 * on that shelf. Centred where they fit, scrolling (and dragging) from the left where they do not.
 */
export function SubjectBar({ active = '' }: { active?: string }) {
	const all = [{ slug: '', name: 'All books', count: books.length }, ...subjects]
	return (
		<nav aria-label='Shelves' className='border-b border-[var(--rule)] bg-[var(--paper)]'>
			<div className='bb-container'>
				<div data-drag-scroll className='-mb-px flex gap-9 overflow-x-auto pt-5 [scrollbar-width:none] lg:gap-11 [&::-webkit-scrollbar]:hidden [&>:first-child]:ms-auto [&>:last-child]:me-auto'>
					{all.map((s) => {
						const Glyph = s.slug ? SUBJECT_ICON[s.slug] ?? BookBookmarkIcon : SquaresFourIcon
						const on = active === s.slug
						return (
							<Link
								key={s.slug || 'all'}
								href={s.slug ? `/books?subject=${s.slug}` : '/books'}
								aria-current={on ? 'page' : undefined}
								draggable={false}
								className={`flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 font-[family-name:var(--font-display)] text-[0.59375rem] font-semibold uppercase tracking-[0.14em] transition ${
									on ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-3)] hover:border-[var(--rule)] hover:text-[var(--ink)]'
								}`}
							>
								<Glyph size={22} weight='duotone' className={on ? 'text-[var(--accent)]' : ''} aria-hidden='true' />
								{s.name}
							</Link>
						)
					})}
				</div>
			</div>
		</nav>
	)
}
