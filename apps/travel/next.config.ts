import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@betterbarmm/ui',
		'@betterbarmm/editorial',
		'@betterbarmm/lgu-data',
		'@betterbarmm/travel-data',
		'@betterbarmm/ai',
		'@betterbarmm/budget-data',
		'@betterbarmm/schemas',
	],
	experimental: {
		externalDir: true,
		// Soft fades between pages (user decision: smoother transitions), through React's <ViewTransition> in the shell.
		viewTransition: true,
	},
}

export default nextConfig
