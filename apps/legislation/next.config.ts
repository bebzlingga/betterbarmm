import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: ['@betterbarmm/ui'],
	experimental: {
		externalDir: true,
	},
	async redirects() {
		return [
			// What this is, how it was compiled, what each dataset holds, and
			// where it falls short used to be three pages that mostly
			// cross-referenced each other. They are one page now; the old paths
			// are kept so existing links still land.
			{ source: '/data', destination: '/about', permanent: true },
			{ source: '/methodology', destination: '/about', permanent: true },
			// The rulebook and the page on powers and limits restated each other
			// — Question Hour, arrest immunity, the conflict-of-interest bar, the
			// Journal's nominal-voting rule and more appeared on both. They are
			// one page now.
			{ source: '/rules', destination: '/how-parliament-works', permanent: true },
		]
	},
}

export default nextConfig
