-- Latest news about the Bangsamoro, gathered from outlets' own RSS feeds.
-- Run after 0005_reports.sql.
--
-- Only what a feed publishes to be shared: the headline, the outlet, the
-- date, the link back and the outlet's own short teaser. Never the article.
-- A run five times a day (scripts/news.ts, from GitHub Actions) or an
-- editor's "Run now" in the admin adds what is new; editors can hide an
-- item that is off-topic.

create table public.news_items (
	id uuid primary key default gen_random_uuid(),
	url text not null unique,
	title text not null,
	source text not null,
	published_at timestamptz,
	summary text not null default '',
	-- Which feed it came from, for the admin's own reading.
	feed text not null default '',
	hidden boolean not null default false,
	fetched_at timestamptz not null default now()
);

create index news_items_published on public.news_items (published_at desc);

create table public.news_runs (
	id uuid primary key default gen_random_uuid(),
	trigger text not null check (trigger in ('schedule', 'manual')),
	started_at timestamptz not null default now(),
	finished_at timestamptz,
	seen integer not null default 0,
	added integer not null default 0,
	errors text[] not null default '{}',
	by_email text not null default ''
);

create index news_runs_started on public.news_runs (started_at desc);

alter table public.news_items enable row level security;
alter table public.news_runs enable row level security;

-- Anyone may read what is not hidden; editors see and change everything.
create policy "news: anyone reads shown" on public.news_items
	for select using (not hidden or public.is_editor());
create policy "news: editors write" on public.news_items
	for all using (public.is_editor()) with check (public.is_editor());

create policy "news runs: editors" on public.news_runs
	for all using (public.is_editor()) with check (public.is_editor());
