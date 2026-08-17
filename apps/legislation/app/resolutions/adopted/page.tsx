import { redirect } from 'next/navigation'

/**
 * The two rolls are read as one list at `/resolutions`, where the
 * adopted/proposed filter separates them again. This route stays so links
 * published before the merge still land somewhere.
 */
export default function AdoptedResolutionsPage() {
	redirect('/resolutions')
}
