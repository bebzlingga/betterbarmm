import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@betterbarmm/ui',
		'@betterbarmm/editorial',
		'@betterbarmm/lgu-data',
		'@betterbarmm/ai',
		'@betterbarmm/travel-data',
		'@betterbarmm/budget-data',
		'@betterbarmm/schemas',
	],
	experimental: {
		externalDir: true,
	},
	// "The two codes" became the Governance Code page, which keeps its comparison.
	async redirects() {
		return [{ source: '/two-codes', destination: '/governance-code', permanent: true }]
	},
}

export default nextConfig
