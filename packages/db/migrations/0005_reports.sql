-- Error reports from readers: "something on this page is wrong". Run after
-- 0004_social.sql.
--
-- Anyone may file one (the public site posts with the anon key); nobody but
-- an editor may read them. Editors work them in the admin's Reports page and
-- close each as fixed or not an error.

create table public.reports (
	id uuid primary key default gen_random_uuid(),
	-- The page the reader was on, and what they say is wrong there.
	page_url text not null check (char_length(page_url) between 8 and 500),
	message text not null check (char_length(message) between 10 and 4000),
	-- Optional: where to tell them it was fixed.
	contact text check (contact is null or char_length(contact) <= 200),
	status text not null default 'new' check (status in ('new', 'fixed', 'dismissed')),
	resolution text not null default '',
	resolved_by uuid references auth.users (id) on delete set null,
	resolved_by_email text not null default '',
	resolved_at timestamptz,
	created_at timestamptz not null default now()
);

create index reports_status on public.reports (status, created_at desc);

alter table public.reports enable row level security;

-- Anyone may file a new report, and only a new one.
create policy "reports: anyone files" on public.reports
	for insert with check (status = 'new' and resolved_by is null and resolution = '');

create policy "reports: editors read" on public.reports
	for select using (public.is_editor());

create policy "reports: editors resolve" on public.reports
	for update using (public.is_editor()) with check (public.is_editor());
