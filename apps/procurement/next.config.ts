import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/editorial', '@betterbarmm/ai', '@betterbarmm/lgu-data', '@betterbarmm/travel-data', '@betterbarmm/budget-data', '@betterbarmm/schemas'],
	experimental: {
		externalDir: true,
	},
	// The notices are read from disk on the server rather than bundled, so the
	// file has to be traced into the deployment by hand.
	outputFileTracingIncludes: {
		'/**': ['../../datasets/procurement/philgeps.json'],
	},
}

export default nextConfig
