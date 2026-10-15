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
2. In the SQL editor, run `migrations/0001_cms.sql`, `0002_history.sql`, `0003_updates.sql`, `0004_social.sql` and `0005_reports.sql`, in that order.
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

## Social posts

The admin's **Social** page writes posts for BetterBARMM's Facebook Page.

1. Anyone signed in writes a post (text, an optional link and image, an
   optional time) and **submits it for review**.
2. An **approver** — an admin, or an editor an admin has ticked "Approves
   posts" for on the Editors page — approves it or sends it back with a note.
   Nobody approves their own post unless they are an admin.
3. Approving sends it to the Page: at once, or to Facebook's own scheduler for
   the time set (at least 15 minutes ahead). The post's page then links to it.

Setup, once:

1. Run `migrations/0004_social.sql`. It adds the `social_posts` table, the
   approver flag, and a public `social` storage bucket for images (Facebook
   fetches a photo by its URL).
2. Get a Page access token: in Meta for Developers, create an app (type
   Business), add **Facebook Login for Business**, then in the Graph API
   Explorer pick the app, add the permissions `pages_manage_posts`,
   `pages_read_engagement` and `pages_show_list`, generate a user token, and
   exchange it for a long-lived one. `GET /me/accounts` with that token lists
   your Pages with their `id` and a Page `access_token` that does not expire.
3. On the admin's Vercel project, add `FACEBOOK_PAGE_ID`,
   `FACEBOOK_PAGE_ACCESS_TOKEN` (server-only — never `NEXT_PUBLIC_`) and,
   optionally, `FACEBOOK_PAGE_NAME` for the preview. The Social page shows
   "Facebook connected" once they are set.

## Reader error reports

Every page on the estate ends with "Spotted an error on this page? Tell us",
which opens betterbarmm.com/report with the page's address filled in. Reports
go into the `reports` table (`0005_reports.sql`): anyone may file one with the
public key, only editors can read them. The admin's **Reports** page lists new
ones; close each as **Fixed** (say what changed) or **Not an error** (say why).

## Latest news

`migrations/0006_news.sql` adds `news_items` and `news_runs`. Run it after `0005_reports.sql`.

- **Schedule:** `.github/workflows/fetch-news.yml` runs `bun db:news` at 5am, 9am, 12nn, 3pm and 9pm Manila time. It uses the same `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets as the updates workflows, and commits nothing.
- **By hand:** `bun db:news manual` from a machine with the service key in `.env`, or **Run now** on the admin's News page.
- **What is kept:** only what a feed publishes to be shared — headline, outlet, date, link and the outlet's own teaser (cut at 240 characters). Feeds are listed in `src/news.ts`; a national outlet's item is kept only when it names the region.
- **Editors** can hide an off-topic item from the admin's News page; hidden items stay out of the public page.
- The public page is `/news` on the www site. It is left out of the navigation for now (see `site-header.tsx`).
