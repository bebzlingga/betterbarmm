import { PageSkeleton } from '@betterbarmm/editorial'
import { ElectionShell } from './_components/election-shell'

/* What a page shows while it streams in: its shape in grey (user decision). Each page wraps itself in the shell, so
   the skeleton does too, or the bar would vanish while the next page loads. On the crimson band its mastheads use. */
export default function Loading() {
	return (
		<ElectionShell>
			<PageSkeleton band='bb-crimson' />
		</ElectionShell>
	)
}
