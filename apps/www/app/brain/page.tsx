import { redirect } from 'next/navigation'

/** The brain is a dialog over the site now, opened by #brain; an old link to /brain lands on it. */
export default function BrainPage() {
	redirect('/#brain')
}
