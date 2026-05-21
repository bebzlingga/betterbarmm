import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui'],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
