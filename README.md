# betterbarmm-platform

This repository is a monorepo for the BetterBARMM platform, built with Next.js App Router and designed for independent subdomain apps.

## Workspace structure

- `apps/www` — public landing site for `betterbarmm.gov`
- `apps/budget` — budget transparency portal for `budget.betterbarmm.gov`
- `apps/legislation` — legislation registry for `bills.betterbarmm.com`
- `apps/admin` — internal administration dashboard for `admin.betterbarmm.gov`

- `packages/ui` — shared UI components and design system primitives
- `packages/charts` — shared chart and visualization utilities
- `packages/config` — shared ESLint, Tailwind, PostCSS, and TypeScript config
- `packages/schemas` — shared Zod schemas and TypeScript domain types
- `packages/db` — shared database client scaffolding and query helpers
- `packages/auth` — shared auth helpers and role utilities
- `packages/budget-data` — generated budget JSON loader and helpers
- `packages/pdf-tools` — PDF extraction and parsing utilities

- `datasets/budget` — budget sample data and generated JSON files

## Getting started

Install dependencies:

```bash
bun install
```

Run local development for all apps:

```bash
bun run dev
```

Build all apps:

```bash
bun run build
```

Lint all workspace packages and apps:

```bash
bun run lint
```

## Budget app design tokens

The budget app uses the same type stack as the other BetterBARMM apps: DM Sans for body and description copy, Outfit for headings, buttons, numeric, and navigation text. Each app loads both with `next/font/google` in its `layout.tsx`, which defines `--font-dm-sans` and `--font-outfit`; the stacks that consume them live in `packages/ui/src/styles.css` as `--font-body`, `--font-display`, and `--font-mono-ui`.
