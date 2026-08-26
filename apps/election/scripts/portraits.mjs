#!/usr/bin/env node
/* ============================================================
   Take in a batch of portraits nobody has to argue about

   Usage:
     bun run portraits ./incoming --credit "Bangsamoro Federalist Party"

   Every file in the folder is matched to a candidate by name, squared,
   compressed, and written into `app/_images/people/`. The generated list in
   `app/_lib/portraits.generated.ts` is rewritten from what is on disk, so the
   file on disk is always the truth about what the site prints.

   `--credit` is required, and it is the point of the whole exercise: the line
   printed under the photograph, naming who released it. A batch without a
   credit is a batch this project cannot publish, so the script refuses rather
   than filing it as "unknown".
   ============================================================ */

import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'

const APP = resolve(import.meta.dirname, '..')
const PEOPLE = join(APP, 'app/_images/people')
const GENERATED = join(APP, 'app/_lib/portraits.generated.ts')
const DATASET = resolve(APP, '../../datasets/election/election.min.json')

const HONORIFICS = /\b(jr|sr|ii|iii|iv|md|atty|engr|hadji|hadja|haji|mp|dcm|cm)\b/g

/** The same key `media.ts` reads by: first and last name, stripped down. */
function personKey(name) {
	const words = name
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(HONORIFICS, ' ')
		.replace(/\b[a-z]\b/g, ' ')
		.replace(/[^a-z ]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 1)

	return words.length >= 2 ? `${words[0]} ${words[words.length - 1]}` : words.join(' ')
}

function camel(slug) {
	const [first, ...rest] = slug.split('-')
	return first + rest.map((part) => part[0].toUpperCase() + part.slice(1)).join('')
}

function candidateNames() {
	const data = JSON.parse(readFileSync(DATASET, 'utf8'))
	const names = [
		...data.sectoral_candidates.map((candidate) => candidate.full_name),
		...data.district_representative_candidates.candidates.map(
			(candidate) => candidate.name_as_reported,
		),
	]
	return new Map(names.map((name) => [personKey(name), name]))
}

/** Square and compress. `sips` ships with macOS; elsewhere the file is copied. */
function place(source, destination) {
	try {
		execFileSync('sips', ['-Z', '320', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', source, '--out', destination], { stdio: 'ignore' })
	} catch {
		copyFileSync(source, destination)
		console.warn(`   (not resized — install sips or resize ${basename(destination)} by hand)`)
	}
}

function rewriteGenerated(credits) {
	const files = readdirSync(PEOPLE)
		.filter((file) => extname(file) === '.jpg')
		.sort()

	const imports = files
		.map((file) => `import ${camel(basename(file, '.jpg'))} from '../_images/people/${file}'`)
		.join('\n')

	const entries = files
		.map((file) => {
			const slug = basename(file, '.jpg')
			const key = slug.replace(/-/g, ' ')
			const credit = credits[key] ?? 'Bangsamoro Parliament'
			return `\t'${key}': { src: ${camel(slug)}, credit: '${credit.replace(/'/g, "\\'")}' },`
		})
		.join('\n')

	writeFileSync(
		GENERATED,
		`/* GENERATED — do not edit by hand.
 *
 * Written by \`bun run portraits <folder> --credit "…"\`. Everything about how
 * these files got here, and why most candidates have none, is in \`media.ts\`
 * beside it.
 */
import type { StaticImageData } from 'next/image'

${imports}

export type PersonPhoto = { src: StaticImageData; credit: string }

export const personPhotos: Record<string, PersonPhoto> = {
${entries}
}
`,
	)

	return files.length
}

function existingCredits() {
	if (!existsSync(GENERATED)) return {}
	const source = readFileSync(GENERATED, 'utf8')
	const credits = {}
	for (const match of source.matchAll(/'([a-z ]+)': \{ src: \w+, credit: '(.+?)' \}/g)) {
		credits[match[1]] = match[2].replace(/\\'/g, "'")
	}
	return credits
}

const args = process.argv.slice(2)
const creditIndex = args.indexOf('--credit')
const folder = args.find((argument) => !argument.startsWith('--') && argument !== args[creditIndex + 1])
const credit = creditIndex === -1 ? null : args[creditIndex + 1]

if (!folder || !credit) {
	console.error('usage: bun run portraits <folder> --credit "Who released these"')
	console.error('   e.g. bun run portraits ./incoming --credit "Bangsamoro Federalist Party"')
	process.exit(1)
}

// A missing folder is the ordinary first run, not a crash. Say what to do with
// it rather than printing a stack trace at somebody who is holding a batch of
// photographs and a question.
if (!existsSync(resolve(folder))) {
	console.error(`No folder at ${resolve(folder)}`)
	console.error('\nPut the photographs in it, named after the people:')
	console.error('   incoming/Abrar Jainuddin Hataman.jpg')
	console.error('   incoming/abdulraof-macacua.png')
	console.error('\nThen run the command again.')
	process.exit(1)
}

const roster = candidateNames()
const credits = existingCredits()
mkdirSync(PEOPLE, { recursive: true })

let placed = 0
const unmatched = []

for (const file of readdirSync(resolve(folder))) {
	if (!/\.(jpe?g|png|webp)$/i.test(file)) continue

	const key = personKey(basename(file, extname(file)))
	const candidate = roster.get(key)

	if (!candidate) {
		unmatched.push(file)
		continue
	}

	const slug = key.replace(/ /g, '-')
	place(join(resolve(folder), file), join(PEOPLE, `${slug}.jpg`))
	credits[key] = credit
	placed += 1
	console.log(`   ${file}  →  ${candidate}`)
}

const total = rewriteGenerated(credits)

console.log(`\n${placed} placed · ${total} portraits on file`)

if (unmatched.length > 0) {
	console.log(`\n${unmatched.length} matched nobody on the ballot — rename them to the candidate's name:`)
	for (const file of unmatched) console.log(`   ${file}`)
}
