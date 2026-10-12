-- Social posts: written in the admin, reviewed by an approver, then sent to
-- the Facebook Page (now, or scheduled on Facebook's own scheduler). Run
-- after 0003_updates.sql.
--
--   draft → in_review → (approve) → posted | scheduled
--                     ↘ (request changes) → draft, with the reviewer's note
--
-- Who may approve: admins, and editors an admin has marked
-- `can_approve_posts`. An editor cannot approve their own post; the admin
-- server action enforces that, and the policy below keeps non-editors out.

alter table public.profiles add column if not exists can_approve_posts boolean not null default false;

create table public.social_posts (
	id uuid primary key default gen_random_uuid(),
	body text not null default '',
	link text,
	-- In the public `social` bucket, so Facebook can fetch it by URL.
	image_path text,
	platforms text[] not null default '{facebook}',
	status text not null default 'draft'
		check (status in ('draft', 'in_review', 'scheduled', 'posted', 'failed')),
	-- When to publish; null means as soon as it is approved.
	scheduled_at timestamptz,
	author_id uuid references auth.users (id) on delete set null,
	author_email text not null default '',
	reviewer_id uuid references auth.users (id) on delete set null,
	reviewer_email text not null default '',
	review_note text not null default '',
	-- Per platform: { "facebook": { "id": "...", "url": "...", "error": "..." } }
	results jsonb not null default '{}',
	submitted_at timestamptz,
	decided_at timestamptz,
	posted_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index social_posts_status on public.social_posts (status, updated_at desc);

alter table public.social_posts enable row level security;

create policy "social_posts: editors read" on public.social_posts
	for select using (public.is_editor());

create policy "social_posts: editors write" on public.social_posts
	for all using (public.is_editor()) with check (public.is_editor());

create trigger social_posts_touch before update on public.social_posts
	for each row execute function public.touch_updated_at();

-- Images for posts. Public, because Facebook fetches a photo by its URL;
-- only editors may upload.
insert into storage.buckets (id, name, public) values ('social', 'social', true)
	on conflict (id) do nothing;

create policy "social images: editors upload" on storage.objects
	for insert with check (bucket_id = 'social' and public.is_editor());

create policy "social images: editors delete" on storage.objects
	for delete using (bucket_id = 'social' and public.is_editor());
