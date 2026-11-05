import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui', '@betterbarmm/editorial', '@betterbarmm/ai', '@betterbarmm/lgu-data', '@betterbarmm/travel-data', '@betterbarmm/budget-data', '@betterbarmm/schemas', '@betterbarmm/db'],
	experimental: {
		externalDir: true,
	},
	// The bid notices and the schools are read from disk on the server rather than
	// bundled, so the files are traced into the deployment by hand.
	outputFileTracingIncludes: {
		'/**': ['../../datasets/procurement/philgeps.json', '../../datasets/education/schools.json', '../../datasets/education/school-histories.json'],
	},
}

export default nextConfig
