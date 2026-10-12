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
- `proposals` — what the nightly fetch found at the sources, waiting for an
  editor in the admin's **Updates** page. See "Automatic updates" below.
- `profiles` — one per signed-in account, with a role: `admin`, `editor` or
  `viewer`. Only admins and editors can write; only admins manage roles.

Row-level security enforces all of this in the database, so a leaked anon key
cannot write anything.

## Setup (once)

1. Create a Supabase project.
2. In the SQL editor, run `migrations/0001_cms.sql`, `0002_history.sql` and `0003_updates.sql`, in that order.
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

## Automatic updates

Every night `.github/workflows/fetch-updates.yml` re-reads Parliament (acts,
bills, resolutions) and PhilGEPS, compares what it got with what the site
holds, and files each difference as a proposal. It never commits.

- **Parliament** changes are filed record by record ("Proposed Resolution 827 —
  status: Filed → Adopted"), against the `records` table — so those
  collections must be seeded first (`bun db:seed legislation`).
- **PhilGEPS** is filed as one proposal for the whole regenerated
  `philgeps.json`, with a one-line summary ("562 new notices · 87 open for
  bids"), the file itself kept in the private `proposals` storage bucket.

In the admin, **Updates** lists what is waiting, with each record's changed
fields side by side. Approving a record writes it into `records` as the
signing-in editor (so it shows in Activity and History); rejecting it means
the same change is not filed again.

Every hour `.github/workflows/publish-updates.yml` runs `bun db:publish`: it
writes approved records — and any other admin edit since the last sync — into
`datasets/`, writes approved files, commits to main, and the sites redeploy.
**Publish approved now** in the admin starts it at once.

Setup, once:

1. Run `migrations/0003_updates.sql`, then `bun db:seed legislation`.
2. In GitHub → Settings → Secrets and variables → Actions, add
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Optional, for **Publish approved now**: a fine-grained GitHub token for
   this repository with Actions read and write, added to the admin's Vercel
   project as `GITHUB_TOKEN`, with `GITHUB_REPOSITORY=bebzlingga/betterbarmm`.

By hand: `bun db:propose <run-id> legislation/proposed-index` files proposals
from the files on disk; `bun db:publish` then `bun db:publish --mark` publishes.
