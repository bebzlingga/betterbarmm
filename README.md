# betterbarmm-platform

This repository is a monorepo for the BetterBARMM platform, built with Next.js App Router and designed for independent subdomain apps.

## Workspace structure

- `apps/www` — public landing site for `betterbarmm.gov`
- `apps/budget` — budget transparency portal for `budget.betterbarmm.gov`
- `apps/bills` — bills tracker for `bills.betterbarmm.gov`
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

The budget app uses Google Sans Flex for body/display text and Oswald for numeric displays only. Keep typography wired through `apps/budget/app/globals.css` with `--font-body`, `--font-display`, `--font-mono-ui`, and `--font-number`.
