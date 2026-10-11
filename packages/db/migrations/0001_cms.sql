-- BetterBARMM CMS: editors, explainers, and every workspace's data collections.
-- Run once in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Editors. Every signed-up user gets a profile; only admins and editors write.
-- ---------------------------------------------------------------------------

create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	email text not null,
	name text not null default '',
	role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
	created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
	insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''));
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

create function public.app_role() returns text
language sql stable security definer set search_path = public as $$
	select role from public.profiles where id = auth.uid();
$$;

create function public.is_editor() returns boolean
language sql stable as $$
	select coalesce(public.app_role() in ('admin', 'editor'), false);
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own or as admin" on public.profiles
	for select using (id = auth.uid() or public.app_role() = 'admin');

create policy "profiles: admins change roles" on public.profiles
	for update using (public.app_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Explainers: articles on www, grouped by workspace category and tagged.
-- ---------------------------------------------------------------------------

create table public.explainers (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	title text not null,
	summary text not null default '',
	body text not null default '',
	category text not null,
	tags text[] not null default '{}',
	status text not null default 'draft' check (status in ('draft', 'published')),
	published_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	updated_by uuid references auth.users (id) on delete set null
);

create index explainers_published on public.explainers (status, published_at desc);
create index explainers_tags on public.explainers using gin (tags);

alter table public.explainers enable row level security;

create policy "explainers: public reads published" on public.explainers
	for select using (status = 'published' or public.is_editor());

create policy "explainers: editors write" on public.explainers
	for all using (public.is_editor()) with check (public.is_editor());

-- ---------------------------------------------------------------------------
-- Records: one row per item in a workspace collection (a reading, a bill, a
-- budget line item…). `data` holds the item exactly as the dataset file does,
-- so a collection round-trips between the files and the database.
-- ---------------------------------------------------------------------------

create table public.records (
	workspace text not null,
	collection text not null,
	key text not null,
	-- What the admin lists and searches by; set from the collection's title() on every write.
	title text not null default '',
	data jsonb not null,
	position integer not null default 0,
	updated_at timestamptz not null default now(),
	updated_by uuid references auth.users (id) on delete set null,
	primary key (workspace, collection, key)
);

create index records_order on public.records (workspace, collection, position);

alter table public.records enable row level security;

create policy "records: public reads" on public.records
	for select using (true);

create policy "records: editors write" on public.records
	for all using (public.is_editor()) with check (public.is_editor());

-- Keep updated_at honest on every write.
create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger explainers_touch before update on public.explainers
	for each row execute function public.touch_updated_at();

create trigger records_touch before update on public.records
	for each row execute function public.touch_updated_at();
