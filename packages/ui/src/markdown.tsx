import { Fragment, type ReactNode } from 'react'

/**
 * The Markdown explainers are written in, rendered to React elements.
 *
 * Covers what an explainer needs: `##`/`###` headings, paragraphs, `-` and
 * `1.` lists, `>` quotes, `**bold**`, `*italic*`, `` `code` `` and
 * `[links](https://…)`. Builds elements rather than HTML strings, so nothing
 * an editor types can inject markup. ponytail: no tables or images; swap in a
 * full Markdown library if explainers need them.
 */
export function Markdown({ source, className }: { source: string; className?: string }) {
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
			if (line.startsWith('>')) {
				const quote: string[] = []
				while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''))
				out.push(<blockquote key={`q${i}`}>{inline(quote.join(' '))}</blockquote>)
				continue
			}
			const para: string[] = []
			while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|\s*[-*]\s|\s*\d+\.\s|>)/.test(lines[i])) {
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
