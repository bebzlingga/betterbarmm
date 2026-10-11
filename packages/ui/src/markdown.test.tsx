import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from './markdown'

test('renders explainer markdown without injecting markup', () => {
	const html = renderToStaticMarkup(
		<Markdown
			source={`## How a bill becomes law\n\nA bill is **filed**, then read *three* times.\nSee [the Parliament](https://parliament.bangsamoro.gov.ph) and [bad](javascript:alert(1)).\n\n- First reading\n- Committee\n\n1. One\n2. Two\n\n> A quote <script>x</script>\n\nUse \`code\`.`}
		/>,
	)
	expect(html).toContain('<h2>How a bill becomes law</h2>')
	expect(html).toContain('<strong>filed</strong>')
	expect(html).toContain('<em>three</em>')
	expect(html).toContain('<a href="https://parliament.bangsamoro.gov.ph" rel="noreferrer">the Parliament</a>')
	expect(html).not.toContain('javascript:')
	expect(html).not.toContain('<script>')
	expect(html).toContain('<ul><li>First reading</li><li>Committee</li></ul>')
	expect(html).toContain('<ol><li>One</li><li>Two</li></ol>')
	expect(html).toContain('<code>code</code>')
})
