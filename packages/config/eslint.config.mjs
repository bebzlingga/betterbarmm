import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/*
 * The estate's lint config, in flat form.
 *
 * It used to be one object with `extends: ['next/core-web-vitals']`, which is
 * the eslintrc shape. That worked only because `next lint` translated it on
 * the way through — and `next lint` was removed in Next 16, so every app's
 * lint script now calls the ESLint CLI directly and the CLI reads flat config
 * only. Spread the shared configs into the array instead of naming them in an
 * `extends` key, which is the same thing said in the form the CLI understands.
 */
export default defineConfig([
	...nextVitals,
	...nextTs,

	// `eslint-config-next` ignores these itself; re-stated because declaring
	// any ignores at all replaces its defaults rather than adding to them.
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

	{
		files: ['**/*.{js,mjs,ts,jsx,tsx}'],
		rules: {
			// The estate links across workspaces — legislation to www, election to
			// legislation — and each app only knows its own pages, so the rule that
			// wants an internal `<Link>` fires on links that are genuinely external.
			'@next/next/no-html-link-for-pages': 'off',
		},
	},
])
