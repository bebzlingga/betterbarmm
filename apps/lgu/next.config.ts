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
}

export default nextConfig
