import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/editorial', '@betterbarmm/ai', '@betterbarmm/lgu-data', '@betterbarmm/travel-data', '@betterbarmm/budget-data', '@betterbarmm/schemas'],
	experimental: {
		externalDir: true,
	},
	// The bid notices and the facilities are read from disk on the server rather than
	// bundled, so the files are traced into the deployment by hand.
	outputFileTracingIncludes: {
		'/**': ['../../datasets/procurement/philgeps.json', '../../datasets/health/facilities.json'],
	},
}

export default nextConfig
