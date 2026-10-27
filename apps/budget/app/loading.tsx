import { PageSkeleton } from '@betterbarmm/editorial'

/* What a page shows while it streams in: its shape in grey (user decision), inside the shell the layout keeps, on the
   crimson band this workspace's mastheads use. */
export default function Loading() {
	return <PageSkeleton band='bb-crimson' />
}
