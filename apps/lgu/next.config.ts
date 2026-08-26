import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/editorial', '@betterbarmm/lgu-data'],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
