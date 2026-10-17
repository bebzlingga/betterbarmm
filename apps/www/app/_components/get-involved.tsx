import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import Link from 'next/link'

/** The site's closing ask, at the foot of every page that does not end on an ask of its own. */
export function GetInvolved() {
	return (
		<CtaPanel
			label='Get involved'
			lines={['Public records get better', 'when people check them.']}
			standfirst='Spotted an error, or have a document worth adding? Every correction and every source makes the record stronger — and the official source is always right where we are wrong.'
		>
			<CtaAction>
				<Link href='/contribute' className='bb-btn bb-btn-brass'>
					Contribute
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</Link>
			</CtaAction>
			<CtaAction>
				<Link href='/about' className='bb-btn bb-btn-ghost'>
					About the project
				</Link>
			</CtaAction>
		</CtaPanel>
	)
}
