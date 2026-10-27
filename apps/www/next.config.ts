import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@betterbarmm/ui',
		'@betterbarmm/editorial',
		'@betterbarmm/lgu-data',
		'@betterbarmm/charts',
		'@betterbarmm/budget-data',
		'@betterbarmm/schemas',
		'@betterbarmm/ai',
		'@betterbarmm/travel-data',
		'@betterbarmm/db',
	],
	experimental: {
		externalDir: true,
	},
	// Places moved to the travel workspace as Travel & Places (user decision); old links follow it there.
	async redirects() {
		return [
			{ source: '/places', destination: 'https://travel.betterbarmm.com', permanent: true },
			// A place's slug only: the photos under /places/ ("…__1.jpg") stay here, and the travel app links to them.
			{ source: '/places/:slug([a-z0-9-]+)', destination: 'https://travel.betterbarmm.com/places/:slug', permanent: true },
		]
	},
	// Pages that read the procurement file from disk on the server.
	outputFileTracingIncludes: {
		'/this-week/**': ['../../datasets/procurement/philgeps.json'],
		'/this-week': ['../../datasets/procurement/philgeps.json'],
		'/api/search': ['../../datasets/procurement/philgeps.json'],
		// Explainers written as Markdown in the repo, read from disk.
		'/explainers': ['./app/explainers/articles/**'],
		'/explainers/**': ['./app/explainers/articles/**'],
	},
}

export default nextConfig
