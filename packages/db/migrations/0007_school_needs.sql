-- What schools need, posted by the people in them: a teacher short of chairs,
-- a school head waiting on a classroom, a student whose school has no water.
-- Run after 0006_news.sql.
--
-- Anyone may post one (the Education workspace posts with the anon key). It
-- waits for an editor, who approves it, declines it, or later marks it met.
-- The public sees approved and met needs only, and never the contact detail a
-- poster leaves: that column is granted to editors alone.

create table public.school_needs (
	id uuid primary key default gen_random_uuid(),
	-- The school, by its DepEd school ID (or its OpenStreetMap id, "osm-…", for a school not
	-- on DepEd's list), with its name and town as posted.
	school_id text not null check (char_length(school_id) between 3 and 40),
	school_name text not null check (char_length(school_name) between 3 and 200),
	area text not null check (char_length(area) <= 60),
	town text not null check (char_length(town) <= 60),
	town_name text not null check (char_length(town_name) <= 100),
	kind text not null check (kind in ('classrooms', 'seats', 'books', 'teachers', 'water', 'electricity', 'toilets', 'internet', 'repairs', 'supplies', 'other')),
	poster text not null check (poster in ('teacher', 'school_head', 'student', 'parent', 'community')),
	title text not null check (char_length(title) between 5 and 120),
	details text not null check (char_length(details) between 20 and 2000),
	-- How many, where known: classrooms short, learners without a seat.
	quantity integer check (quantity is null or quantity between 1 and 100000),
	-- Private: how to reach the poster. Never shown on the site.
	contact text check (contact is null or char_length(contact) <= 200),
	status text not null default 'new' check (status in ('new', 'approved', 'declined', 'met')),
	-- The editor's public word on it: what was checked, or who met it.
	note text not null default '' check (char_length(note) <= 1000),
	reviewed_by uuid references auth.users (id) on delete set null,
	reviewed_by_email text not null default '',
	reviewed_at timestamptz,
	met_at timestamptz,
	created_at timestamptz not null default now()
);

create index school_needs_status on public.school_needs (status, created_at desc);
create index school_needs_school on public.school_needs (school_id);

alter table public.school_needs enable row level security;

-- Anyone may post a new need, and only a new one.
create policy "school_needs: anyone posts" on public.school_needs
	for insert with check (status = 'new' and reviewed_by is null and note = '' and met_at is null);

-- The public reads what an editor has approved; editors read everything.
create policy "school_needs: public reads approved" on public.school_needs
	for select using (status in ('approved', 'met') or public.is_editor());

create policy "school_needs: editors review" on public.school_needs
	for update using (public.is_editor()) with check (public.is_editor());

-- Column by column, so the contact detail cannot be read with the anon key
-- even on an approved row. Editors sign in, and so read as `authenticated`.
revoke all on public.school_needs from anon;
grant insert (school_id, school_name, area, town, town_name, kind, poster, title, details, quantity, contact) on public.school_needs to anon;
grant select (id, school_id, school_name, area, town, town_name, kind, poster, title, details, quantity, status, note, reviewed_at, met_at, created_at) on public.school_needs to anon;
