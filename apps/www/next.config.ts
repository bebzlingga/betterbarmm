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
	// My Area reads the procurement file from disk on the server.
	outputFileTracingIncludes: {
		'/my-area/**': ['../../datasets/procurement/philgeps.json'],
		'/this-week/**': ['../../datasets/procurement/philgeps.json'],
		'/this-week': ['../../datasets/procurement/philgeps.json'],
		'/api/search': ['../../datasets/procurement/philgeps.json'],
		// Explainers written as Markdown in the repo, read from disk.
		'/explainers': ['./app/explainers/articles/**'],
		'/explainers/**': ['./app/explainers/articles/**'],
	},
}

export default nextConfig
