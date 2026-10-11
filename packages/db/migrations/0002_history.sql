-- Revision history for records and explainers, and a marker for the last
-- db:pull/db:seed. Run after 0001_cms.sql.

-- ---------------------------------------------------------------------------
-- Every editor change, with the row as it was before and after. Written by
-- triggers, so no code path can skip it. Changes made by the seed and pull
-- scripts (service role, no signed-in user) are not logged — a seed would
-- otherwise add tens of thousands of rows that record nothing anyone did.
-- ---------------------------------------------------------------------------

create table public.revisions (
	id bigint generated always as identity primary key,
	entity text not null check (entity in ('record', 'explainer')),
	-- Which row: workspace/collection/key for a record, the id for an explainer.
	workspace text,
	collection text,
	key text,
	explainer_id uuid,
	title text not null default '',
	action text not null check (action in ('insert', 'update', 'delete')),
	before jsonb,
	after jsonb,
	changed_by uuid references auth.users (id) on delete set null,
	changed_by_email text not null default '',
	changed_at timestamptz not null default now()
);

create index revisions_record on public.revisions (workspace, collection, key, changed_at desc);
create index revisions_explainer on public.revisions (explainer_id, changed_at desc);
create index revisions_recent on public.revisions (changed_at desc);

alter table public.revisions enable row level security;

create policy "revisions: editors read" on public.revisions
	for select using (public.is_editor());
-- No insert/update/delete policies: only the triggers below write here.

create function public.log_revision() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	uid uuid := auth.uid();
	row_new jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
	row_old jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
	row_any jsonb := coalesce(row_new, row_old);
begin
	if uid is null then
		return null;
	end if;
	-- An update that changed nothing but the timestamp is not a revision.
	if tg_op = 'UPDATE' and (row_new - 'updated_at' - 'updated_by') = (row_old - 'updated_at' - 'updated_by') then
		return null;
	end if;
	insert into public.revisions (
		entity, workspace, collection, key, explainer_id, title, action, before, after, changed_by, changed_by_email
	) values (
		case when tg_table_name = 'records' then 'record' else 'explainer' end,
		row_any ->> 'workspace',
		row_any ->> 'collection',
		row_any ->> 'key',
		case when tg_table_name = 'explainers' then (row_any ->> 'id')::uuid end,
		coalesce(row_any ->> 'title', ''),
		lower(tg_op),
		row_old,
		row_new,
		uid,
		coalesce((select email from public.profiles where id = uid), '')
	);
	return null;
end;
$$;

create trigger records_history after insert or update or delete on public.records
	for each row execute function public.log_revision();

create trigger explainers_history after insert or update or delete on public.explainers
	for each row execute function public.log_revision();

-- ---------------------------------------------------------------------------
-- When the files and the database were last brought level. db:pull and
-- db:seed set it; the admin counts records edited since.
-- ---------------------------------------------------------------------------

create table public.sync_state (
	name text primary key,
	at timestamptz not null default now()
);

alter table public.sync_state enable row level security;

create policy "sync_state: editors read" on public.sync_state
	for select using (public.is_editor());
