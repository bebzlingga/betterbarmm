export type UserRole = 'admin' | 'editor' | 'viewer'

export interface UserProfile {
	id: string
	email: string
	name: string
	role: UserRole
}

export function requireRole(role: UserRole, currentRole: UserRole) {
	if (currentRole !== role) {
		throw new Error('Unauthorized')
	}
}
