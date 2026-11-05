import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/editorial', '@betterbarmm/ai', '@betterbarmm/schemas'],
	experimental: {
		externalDir: true,
	},
}

export default nextConfig
