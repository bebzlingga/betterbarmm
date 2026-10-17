import { DirectoryIndex } from '../_components/directory-index-view'

/** The index is always underneath; an office, a province, a town or the Parliament list opens over it as a dialog. */
export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<DirectoryIndex />
			{children}
		</>
	)
}
