import { Fragment, type ReactNode } from 'react'

/**
 * The Markdown explainers are written in, rendered to React elements.
 *
 * Covers what an explainer needs: `##`/`###` headings, paragraphs, `-` and
 * `1.` lists, `>` quotes, `**bold**`, `*italic*`, `` `code` `` and
 * `[links](https://…)` and pipe tables. Builds elements rather than HTML
 * strings, so nothing an editor types can inject markup. ponytail: no images
 * or nested lists; swap in a full Markdown library if explainers need them.
 */
export function Markdown({
	source,
	className,
	figures = {},
}: {
	source: string
	className?: string
	/** Rendered in place of a line reading `{{figure:name}}`, for graphics an article carries. */
	figures?: Record<string, ReactNode>
}) {
	return <div className={className}>{blocks(source)}</div>

	function blocks(text: string): ReactNode[] {
		const out: ReactNode[] = []
		const lines = text.replace(/\r\n/g, '\n').split('\n')
		let i = 0
		while (i < lines.length) {
			const line = lines[i]
			if (!line.trim()) {
				i++
				continue
			}
			const figure = line.trim().match(/^\{\{figure:([\w-]+)\}\}$/)
			if (figure) {
				out.push(<Fragment key={`f${i}`}>{figures[figure[1]] ?? null}</Fragment>)
				i++
				continue
			}
			const heading = line.match(/^(#{2,4})\s+(.*)$/)
			if (heading) {
				const Tag = (`h${heading[1].length}` as 'h2' | 'h3' | 'h4')
				out.push(<Tag key={i}>{inline(heading[2])}</Tag>)
				i++
				continue
			}
			const listKind = /^\s*[-*]\s+/.test(line) ? 'ul' : /^\s*\d+\.\s+/.test(line) ? 'ol' : null
			if (listKind) {
				const items: ReactNode[] = []
				const marker = listKind === 'ul' ? /^\s*[-*]\s+/ : /^\s*\d+\.\s+/
				while (i < lines.length && marker.test(lines[i])) {
					items.push(<li key={i}>{inline(lines[i].replace(marker, ''))}</li>)
					i++
				}
				const List = listKind
				out.push(<List key={`l${i}`}>{items}</List>)
				continue
			}
			// A pipe table: header row, a `| --- |` rule, then body rows.
			if (line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')) {
				const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
				const head = cells(line)
				const body: string[][] = []
				i += 2
				while (i < lines.length && lines[i].trim().startsWith('|')) body.push(cells(lines[i++]))
				out.push(
					<div key={`t${i}`} className='md-table'>
						<table>
							<thead>
								<tr>{head.map((cell, c) => <th key={c}>{inline(cell)}</th>)}</tr>
							</thead>
							<tbody>
								{body.map((row, r) => (
									<tr key={r}>{row.map((cell, c) => <td key={c}>{inline(cell)}</td>)}</tr>
								))}
							</tbody>
						</table>
					</div>,
				)
				continue
			}
			if (line.startsWith('>')) {
				const quote: string[] = []
				while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''))
				out.push(<blockquote key={`q${i}`}>{inline(quote.join(' '))}</blockquote>)
				continue
			}
			const para: string[] = []
			while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|\s*[-*]\s|\s*\d+\.\s|>|\s*\||\{\{figure:)/.test(lines[i])) {
				para.push(lines[i++])
			}
			out.push(<p key={`p${i}`}>{inline(para.join(' '))}</p>)
		}
		return out
	}

	function inline(text: string): ReactNode[] {
		const parts: ReactNode[] = []
		const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g
		let last = 0
		let match: RegExpExecArray | null
		while ((match = pattern.exec(text))) {
			if (match.index > last) parts.push(text.slice(last, match.index))
			const key = match.index
			if (match[2]) parts.push(<strong key={key}>{match[2]}</strong>)
			else if (match[3]) parts.push(<em key={key}>{match[3]}</em>)
			else if (match[4]) parts.push(<code key={key}>{match[4]}</code>)
			else {
				// Only web and mail links; a `javascript:` URL renders as plain text.
				const href = match[6]
				parts.push(
					/^(https?:|mailto:|\/)/.test(href) ? (
						<a key={key} href={href} rel={href.startsWith('/') ? undefined : 'noreferrer'}>
							{match[5]}
						</a>
					) : (
						<Fragment key={key}>{match[5]}</Fragment>
					),
				)
			}
			last = pattern.lastIndex
		}
		if (last < text.length) parts.push(text.slice(last))
		return parts
	}
}
