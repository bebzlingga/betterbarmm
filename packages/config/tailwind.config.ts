import type { Config } from 'tailwindcss'

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					950: '#0f172a',
					900: '#1e293b',
					800: '#334155',
					700: '#475569',
					600: '#64748b',
					500: '#94a3b8',
					400: '#cbd5e1',
					300: '#e2e8f0',
					200: '#f1f5f9',
					100: '#f8fafc',
				},
			},
		},
	},
	plugins: [],
}

export default config
