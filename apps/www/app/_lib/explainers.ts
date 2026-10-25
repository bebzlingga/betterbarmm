import fs from 'node:fs'
import path from 'node:path'
import { type Explainer, type ExplainerCategory, getPublishedExplainer, listPublishedExplainers } from '@betterbarmm/db'

/* ============================================================
   Explainers from two places

   The admin publishes short explainers to the database; longer pieces
   are written as Markdown in app/explainers/articles, versioned with
   the site. Both read the same, so the Explainers page lists them as
   one set, newest first, and a slug is looked up in the files first.

   An article's front matter: title, summary, category, tags (comma
   separated), date (YYYY-MM-DD) and author.
   ============================================================ */

export type Article = Explainer & { author?: string }

const DIR = path.join(process.cwd(), 'app/explainers/articles')

function parse(file: string): Article {
	const text = fs.readFileSync(path.join(DIR, file), 'utf8')
	const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
	if (!match) throw new Error(`Explainer ${file} has no front matter`)
	const meta = Object.fromEntries(
		match[1]!.split('\n').map((line) => {
			const cut = line.indexOf(':')
			return [line.slice(0, cut).trim(), line.slice(cut + 1).trim()]
		}),
	) as Record<string, string>
	const slug = file.replace(/\.md$/, '')
	const date = `${meta.date}T00:00:00+08:00`
	return {
		id: `file:${slug}`,
		slug,
		title: meta.title ?? slug,
		summary: meta.summary ?? '',
		body: match[2]!.trim(),
		category: (meta.category ?? 'general') as ExplainerCategory,
		tags: (meta.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
		status: 'published',
		published_at: date,
		created_at: date,
		updated_at: date,
		author: meta.author,
	}
}

function fileArticles(): Article[] {
	try {
		return fs.readdirSync(DIR).filter((file) => file.endsWith('.md')).map(parse)
	} catch {
		return []
	}
}

/** The admin's explainers, or none when the database cannot be reached: the files still make the page. */
async function fromDatabase<T>(read: () => Promise<T>, fallback: T): Promise<T> {
	try {
		return await read()
	} catch {
		return fallback
	}
}

export async function listExplainers(): Promise<Article[]> {
	const files = fileArticles()
	const taken = new Set(files.map((article) => article.slug))
	const db = (await fromDatabase(listPublishedExplainers, [])).filter((explainer) => !taken.has(explainer.slug))
	return [...files, ...db].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
}

export async function getExplainer(slug: string): Promise<Article | null> {
	return fileArticles().find((article) => article.slug === slug) ?? (await fromDatabase(() => getPublishedExplainer(slug), null))
}
