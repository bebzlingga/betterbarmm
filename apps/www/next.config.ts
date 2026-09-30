import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@betterbarmm/ui',
		'@betterbarmm/editorial',
		'@betterbarmm/lgu-data',
		'@betterbarmm/charts',
		'@betterbarmm/budget-data',
		'@betterbarmm/schemas',
		'@betterbarmm/ai',
		'@betterbarmm/travel-data',
	],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
