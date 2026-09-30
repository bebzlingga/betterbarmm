import type { Config } from 'tailwindcss'

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: {
					950: '#00142f',
					900: '#2d3e4f',
					800: '#003d8d',
					700: '#6b1a11',
					600: '#8a2418',
					500: '#3385ef',
					400: '#66a3f3',
					300: '#99c2f7',
					200: '#cce0fb',
					100: '#fbf1ef',
				},
			},
		},
	},
	plugins: [],
}

export default config
