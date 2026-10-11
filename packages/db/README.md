# @betterbarmm/db — the CMS database

Supabase (Postgres + Auth) behind the admin dashboard (`apps/admin`) and the
explainers on `www`.

## Tables

- `explainers` — articles on www, with a workspace `category`, `tags`, Markdown
  `body` and a draft/published `status`. The public sees published ones only.
- `records` — every item of every workspace collection listed in
  `src/collections.ts`, stored as the JSON object it is in `datasets/`.
- `revisions` — every editor change to a record or explainer, with the row
  before and after. Written by database triggers; the admin shows it as each
  item's History (with restore) and as the Activity log, where deleted items
  can be brought back. Changes made by `db:seed`/`db:pull` are not logged.
- `sync_state` — when each collection was last seeded or pulled, so the admin
  can count records edited since and say when a pull is due.
- `profiles` — one per signed-in account, with a role: `admin`, `editor` or
  `viewer`. Only admins and editors can write; only admins manage roles.

Row-level security enforces all of this in the database, so a leaked anon key
cannot write anything.

## Setup (once)

1. Create a Supabase project.
2. In the SQL editor, run `migrations/0001_cms.sql`, then `migrations/0002_history.sql`.
3. Authentication → Sign In / Providers: turn **off** "Allow new users to sign up".
   Editors are invited instead (Authentication → Users → Invite).
4. Copy `.env.example` at the repo root to `.env`, and add the same two
   `NEXT_PUBLIC_*` variables to the `admin` and `www` projects on Vercel.
5. Invite yourself, sign in once, then make yourself admin in the SQL editor:
   `update profiles set role = 'admin' where email = 'you@example.com';`
6. Load the datasets: `bun db:seed` from the repo root.

## How edits reach the sites

Explainers are read live from the database by www, within about a minute.

The workspaces still read their data from the files in `datasets/`. To publish
data edits made in the admin:

    bun db:pull      # writes changed records back into datasets/
    git diff         # only the edited records change
    git commit && deploy

`bun db:seed` goes the other way and overwrites the database from the files —
run `bun db:pull` first if anyone has edited in the admin since.

Both take an optional `workspace` or `workspace/collection` argument, e.g.
`bun db:pull legislation/readings`.

Deleting a record from a folder collection (acts, bill and resolution records)
removes it from the database but not its file; delete the file by hand.
