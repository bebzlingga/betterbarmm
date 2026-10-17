import { runNewsFetch } from '../src/news'
import { serviceClient } from './client'

/* `bun db:news` — read the news feeds and add what is new. GitHub Actions
   runs it when started by hand (fetch-news.yml); `manual` marks a run by hand. */

const run = await runNewsFetch(serviceClient(), process.argv[2] === 'manual' ? 'manual' : 'schedule')
console.log(`news: ${run.added} new of ${run.seen} read${run.errors.length ? `; ${run.errors.length} feed errors: ${run.errors.join(' | ')}` : ''}`)
