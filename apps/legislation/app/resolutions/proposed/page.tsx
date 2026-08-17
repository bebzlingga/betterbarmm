import { redirect } from 'next/navigation'

/** See `../adopted/page.tsx` — both rolls now live at `/resolutions`. */
export default function ProposedResolutionsPage() {
	redirect('/resolutions')
}
