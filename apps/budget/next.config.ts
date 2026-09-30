import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@betterbarmm/ui',
		'@betterbarmm/editorial',
		'@betterbarmm/budget-data',
		'@betterbarmm/schemas',
		'@betterbarmm/ai',
		'@betterbarmm/lgu-data',
		'@betterbarmm/travel-data',
	],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
