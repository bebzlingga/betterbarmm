-- Updates found by the nightly fetch, waiting for an editor. Run after
-- 0002_history.sql.
--
-- The nightly job (.github/workflows/fetch-updates.yml) re-reads the sources,
-- compares what it got with what the site holds, and files each difference
-- here as a proposal. Nothing reaches the site until an editor approves it:
--
--   a record proposal  — approving writes it into `records` (so the edit is
--                        logged in `revisions` under the editor's name);
--   a file proposal    — a whole regenerated dataset too large to review
--                        record by record (PhilGEPS), stored in the private
--                        `proposals` bucket with a summary of what changed.
--
-- The publish job (.github/workflows/publish-updates.yml) then writes
-- approved work into datasets/ and commits it, and the sites redeploy.

create table public.proposals (
	id bigint generated always as identity primary key,
	-- Which nightly run found it, e.g. the GitHub run id.
	run_id text not null,
	kind text not null check (kind in ('record', 'file')),

	-- A record proposal.
	workspace text,
	collection text,
	key text,
	title text not null default '',
	action text check (action in ('insert', 'update', 'delete')),
	before jsonb,
	after jsonb,
	-- Where a new record goes: halfway between its neighbours at the source.
	position double precision,

	-- A file proposal.
	file_path text,
	storage_path text,

	-- One line on what changed, written by the job.
	summary text not null default '',
	status text not null default 'pending'
		check (status in ('pending', 'approved', 'rejected', 'superseded', 'published')),
	created_at timestamptz not null default now(),
	decided_at timestamptz,
	decided_by uuid references auth.users (id) on delete set null,
	decided_by_email text not null default '',
	published_at timestamptz,

	check (
		(kind = 'record' and workspace is not null and collection is not null and key is not null and action is not null)
		or (kind = 'file' and file_path is not null and storage_path is not null)
	)
);

create index proposals_pending on public.proposals (status, workspace, collection, created_at desc);
-- At most one pending proposal per record or file: a newer find supersedes it.
create unique index proposals_one_pending_record on public.proposals (workspace, collection, key)
	where status = 'pending' and kind = 'record';
create unique index proposals_one_pending_file on public.proposals (file_path)
	where status = 'pending' and kind = 'file';

alter table public.proposals enable row level security;

create policy "proposals: editors read" on public.proposals
	for select using (public.is_editor());

-- Editors decide: approve or reject. Only the service role (the jobs) inserts.
create policy "proposals: editors decide" on public.proposals
	for update using (public.is_editor()) with check (public.is_editor());

-- So a new record can sit between two existing ones without renumbering
-- every record after it (each renumbering would be a logged revision).
alter table public.records alter column position type double precision;

-- The regenerated files behind file proposals. Private: only the service role
-- reads or writes them.
insert into storage.buckets (id, name, public) values ('proposals', 'proposals', false)
	on conflict (id) do nothing;
