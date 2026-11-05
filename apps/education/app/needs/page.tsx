import { NEED_KINDS, listSchoolNeeds } from '@betterbarmm/db'
import { PlusIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { NeedCard } from '../_components/need-card'
import { Masthead } from '../_components/parts'
import { schoolAreas } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Needs',
	description: 'What schools in the Bangsamoro say they need, posted by their teachers, students and parents and checked by our editors.',
}

// New posts appear within a minute of an editor approving them.
export const revalidate = 60

const CHIP =
	'border border-[var(--rule)] px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:border-[var(--ink)] data-[active=true]:border-[var(--ink)] data-[active=true]:bg-[var(--ink)] data-[active=true]:text-[var(--paper)]'

export default async function NeedsPage({ searchParams }: { searchParams: Promise<{ area?: string; kind?: string }> }) {
	const { area, kind } = await searchParams
	const all = await listSchoolNeeds()
	const shown = all.filter((n) => (!area || n.area === area) && (!kind || n.kind === kind))
	const href = (next: { area?: string; kind?: string }) => {
		const q = new URLSearchParams(Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])))
		return q.size ? `/needs?${q}` : '/needs'
	}
	const open = all.filter((n) => n.status === 'approved').length

	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='What schools need'
				note='Posted by the teachers, school heads, students and parents who know a school best, and checked by our editors before they appear. So that the ministry, the towns, donors and volunteers can see where help is needed.'
			>
				<div className='mt-10 flex flex-wrap items-center gap-x-8 gap-y-4'>
					<Link href='/needs/new' className='bb-btn bb-btn-brass'>
						<PlusIcon size={14} weight='bold' aria-hidden='true' />
						Post a need
					</Link>
					<p className='text-[0.875rem] text-[var(--ink-2)]'>
						{open ? `${open} open, ${all.length - open} met` : 'Be the first to post for your school.'}
					</p>
				</div>
			</Masthead>

			<section className='bb-container bb-section'>
				{all.length ? (
					<>
						<nav aria-label='Filter needs' className='flex flex-col gap-3'>
							<div className='flex flex-wrap gap-2'>
								<Link href={href({ kind })} data-active={!area} className={CHIP}>
									All areas
								</Link>
								{schoolAreas
									.filter((a) => all.some((n) => n.area === a.slug))
									.map((a) => (
										<Link key={a.slug} href={href({ area: a.slug, kind })} data-active={area === a.slug} className={CHIP}>
											{a.name}
										</Link>
									))}
							</div>
							<div className='flex flex-wrap gap-2'>
								<Link href={href({ area })} data-active={!kind} className={CHIP}>
									Everything
								</Link>
								{NEED_KINDS.filter((k) => all.some((n) => n.kind === k.value)).map((k) => (
									<Link key={k.value} href={href({ area, kind: k.value })} data-active={kind === k.value} className={CHIP}>
										{k.label}
									</Link>
								))}
							</div>
						</nav>
						<ul className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{shown.map((n) => (
								<li key={n.id}>
									<NeedCard need={n} />
								</li>
							))}
						</ul>
					</>
				) : (
					<div className='max-w-[44rem] border border-dashed border-[var(--rule)] p-8'>
						<h2 className='text-[1.25rem] font-extrabold text-[var(--ink)]'>No needs posted yet</h2>
						<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							If your school is short of classrooms, chairs, books, teachers, water or anything else its learners need, tell us. Pick
							the school, say what is missing and how many learners it affects. An editor checks it, then it goes on the school&rsquo;s
							page and here.
						</p>
						<Link href='/needs/new' className='bb-btn bb-btn-accent mt-6'>
							Post a need
						</Link>
					</div>
				)}

				<section className='mt-16 grid gap-8 border-t border-[var(--rule)] pt-10 md:grid-cols-3'>
					{[
						['Anyone in the school can post', 'A teacher, the school head, a student, a parent, or someone in the community who knows the school.'],
						['An editor checks every post', 'That the school is real and the post names no child. Nothing appears until it is approved.'],
						['Your contact stays private', 'Leave an email or a number if you like. Only our editors see it, to check the post or to connect you with help.'],
					].map(([title, body]) => (
						<div key={title}>
							<h3 className='text-[1rem] font-bold text-[var(--ink)]'>{title}</h3>
							<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-3)]'>{body}</p>
						</div>
					))}
				</section>
			</section>
		</>
	)
}
