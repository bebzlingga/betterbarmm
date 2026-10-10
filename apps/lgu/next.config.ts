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
	// Old addresses of renamed pages: "The two codes" became the Governance
	// Code page, and the URLs now say what is on them.
	async redirects() {
		return [
			{ source: '/two-codes', destination: '/governance-code', permanent: true },
			{ source: '/stats', destination: '/finances', permanent: true },
			{ source: '/spending', destination: '/regional-budget', permanent: true },
		]
	},
}

export default nextConfig
