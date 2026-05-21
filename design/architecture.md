# BetterBARMM Platform Design

## Monorepo architecture

This repository is organized as a multi-app monorepo with independent Next.js apps for each public subdomain.

- `apps/www` — public landing site for `betterbarmm.gov`
- `apps/budget` — budget transparency portal for `budget.betterbarmm.gov`
- `apps/bills` — bills tracker for `bills.betterbarmm.gov`
- `apps/admin` — admin dashboard for `admin.betterbarmm.gov`

Shared code lives in `packages/*` so each app can evolve independently while reusing UI, schemas, and domain helpers.

## Shared packages

- `packages/ui` — shared design system components and visual primitives.
- `packages/charts` — shared formatting and chart utilities for budget and reporting.
- `packages/config` — common ESLint, Tailwind, PostCSS, and TypeScript config.
- `packages/schemas` — shared Zod schemas and TypeScript models for budget data.
- `packages/db` — database client scaffolding for future Postgres/Supabase-backed features.
- `packages/auth` — shared role and auth utilities.
- `packages/budget-data` — budget JSON loader and sample dataset support.
- `packages/pdf-tools` — PDF parsing and extraction utilities.

## Subdomain deployment model

Each app is intended to deploy independently on Vercel or another platform:

- `apps/www` -> `betterbarmm.gov`
- `apps/budget` -> `budget.betterbarmm.gov`
- `apps/bills` -> `bills.betterbarmm.gov`
- `apps/admin` -> `admin.betterbarmm.gov`

This avoids a single giant app and enables separate release cycles, caching, and permissions for each domain.

## Design inspiration

The visual and layout direction should be inspired by the BetterGov dictionary-style site:

- Clean government data presentation
- Bold headings with accessible typography
- Structured cards and summary panels
- Fast entry points for year-over-year comparisons and document traceability

## Future layout notes

### Budget portal

- Year overview page with total appropriation and top agencies
- Agency detail pages with programs and expense breakdowns
- Program pages with personnel, MOOE, capital outlays, and performance indicators
- Search, filters, and comparison views
- PDF/source traceability metadata for each line item

### Bills tracker

- List and detail pages for bills, resolutions, and acts
- Metadata: bill number, title, author, committee, status, session, versions
- PDF attachments, related acts, and committee history
- Search and filter workflows with live updates

### Admin dashboard

- Bill metadata editors
- Budget data review pages
- Agency alias normalization
- Validation and extraction queues
- Public content management for static site pages
