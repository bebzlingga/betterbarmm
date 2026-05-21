export default [
	{
		files: ['**/*.{js,ts,jsx,tsx}'],
		languageOptions: {
			sourceType: 'module',
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		extends: ['next/core-web-vitals'],
		rules: {
			'@next/next/no-html-link-for-pages': 'off',
		},
	},
]
