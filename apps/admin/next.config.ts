import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/db'],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
