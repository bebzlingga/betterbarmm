import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/charts', '@betterbarmm/budget-data', '@betterbarmm/schemas'],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
