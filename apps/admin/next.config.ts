import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/db'],
	experimental: {
		externalDir: true,
		// Social posts carry a photo through a server action; the default is 1 MB.
		serverActions: { bodySizeLimit: '10mb' },
	},
}

export default nextConfig
