#!/usr/bin/env node
/* Vercel's "Ignored Build Step" for every app in this monorepo: exit 0 skips the build, exit 1 builds.

   Vercel runs it from the project's Root Directory (apps/<name>), set as `ignoreCommand` in that app's vercel.json.
   It builds when anything the app is made from changed since the project's last successful deployment
   (VERCEL_GIT_PREVIOUS_SHA): the app's own folder, every workspace package it depends on (followed through their
   own dependencies), every datasets/ folder any of those import or read, and the root manifest, lockfile and Turbo
   config. `turbo-ignore` alone is not enough here: the apps read datasets/ directly, and datasets/ is not a
   workspace package, so a data-only push would skip the apps whose pages show that data.

   Anything it cannot settle — no previous deployment, a commit it cannot fetch, a git error — builds.

   Check it locally: `node scripts/vercel-ignore.mjs --dry apps/www <sha>` prints what it watches and its decision. */
import { execFileSync, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const run = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
const dry = process.argv[2] === '--dry'
const root = run('git rev-parse --show-toplevel')
// Every git command from the root: Vercel runs this from apps/<name>, and the paths below are the root's.
const sh = (cmd) => run(cmd, root)
const app = dry ? process.argv[3] : path.relative(root, process.cwd())
const prev = dry ? process.argv[4] : process.env.VERCEL_GIT_PREVIOUS_SHA

const decide = (build, why) => {
	console.log(`${build ? 'Build' : 'Skip'} ${app}: ${why}`)
	process.exit(build ? 1 : 0)
}

if (!prev) decide(true, 'no previous deployment to compare with')

// Every workspace package by name, so a dependency can be followed to its folder.
const workspaces = new Map()
for (const group of ['apps', 'packages']) {
	for (const dir of fs.readdirSync(path.join(root, group))) {
		const manifest = path.join(root, group, dir, 'package.json')
		if (fs.existsSync(manifest)) workspaces.set(JSON.parse(fs.readFileSync(manifest, 'utf8')).name, `${group}/${dir}`)
	}
}

// The app and the packages it is built from, transitively.
const dirs = new Set([app])
const queue = [app]
while (queue.length) {
	const manifest = JSON.parse(fs.readFileSync(path.join(root, queue.shift(), 'package.json'), 'utf8'))
	for (const name of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })) {
		const dir = workspaces.get(name)
		if (dir && !dirs.has(dir)) dirs.add(dir), queue.push(dir)
	}
}

// The data folders that code imports or reads, in code files only (a README or a comment in SQL builds nothing):
// `datasets/news/...` in a path, join(..., 'datasets', 'budget'), and a path that ends at the folder itself
// ('../../datasets', as www's open-data build reads it), which means all of it.
// A package's own scripts/ are tools run by hand (seeding, publishing), never imported into an app; an app's are its
// build steps (www's prebuild), so they count.
const code = [
	...[...dirs].flatMap((d) => ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json'].map((x) => `:(glob)${d}/**/*.${x}`)),
	':(exclude,glob)packages/*/scripts/**',
]
const grep = (pattern) => {
	try {
		// No shell: the pattern holds quotes and backticks.
		return execFileSync('git', ['grep', '-hoE', pattern, '--', ...code], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
			.split('\n')
			.filter(Boolean)
	} catch {
		return [] // git grep exits 1 when nothing matches
	}
}
const data = new Set(grep('datasets/[A-Za-z0-9_-]+'))
for (const hit of grep(`['"]datasets['"], *['"][A-Za-z0-9_-]+`)) data.add(`datasets/${hit.match(/([A-Za-z0-9_-]+)$/)[1]}`)
if (grep("/datasets['\"`]").length) data.add('datasets')
const watched = [...dirs, ...(data.has('datasets') ? ['datasets'] : [...data]), 'package.json', 'bun.lock', 'turbo.json']

// A shallow clone may not hold the previous deployment's commit; fetch it, and build if that fails.
try {
	sh(`git cat-file -e ${prev}^{commit}`)
} catch {
	try {
		sh(`git fetch --quiet --depth=100 origin ${prev}`)
	} catch {
		decide(true, `cannot fetch ${prev.slice(0, 7)}`)
	}
}

let changed
try {
	changed = sh(`git diff --name-only ${prev} HEAD -- ${watched.map((p) => `'${p}'`).join(' ')}`)
} catch {
	decide(true, 'git diff failed')
}
if (dry) console.log(`watching:\n  ${watched.join('\n  ')}`)
changed
	? decide(true, `${changed.split('\n').length} changed file(s) since ${prev.slice(0, 7)}, e.g. ${changed.split('\n')[0]}`)
	: decide(false, `nothing it is built from changed since ${prev.slice(0, 7)}`)
