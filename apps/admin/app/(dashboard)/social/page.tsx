import type { SocialPost } from "@betterbarmm/db";
import { ArrowSquareOutIcon, FacebookLogoIcon, MegaphoneIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { EmptyState, PageHeader, ago } from "../../_components/ui";
import { facebookConfigured } from "../../_lib/facebook";
import { requireEditor } from "../../_lib/auth";
import { STATUS, whenLabel } from "./post-preview";

const TABS = [
  ["in_review", "In review"],
  ["draft", "Drafts"],
  ["scheduled", "Scheduled"],
  ["posted", "Posted"],
  ["failed", "Failed"],
  ["all", "All"],
] as const;


export default async function SocialPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase } = await requireEditor();
  const { status: wanted } = await searchParams;
  const status = TABS.some(([s]) => s === wanted) ? wanted! : "in_review";

  let query = supabase.from("social_posts").select("*").order("updated_at", { ascending: false }).limit(200);
  if (status !== "all") query = query.eq("status", status);
  const [{ data, error }, { data: counts }] = await Promise.all([query, supabase.from("social_posts").select("status")]);
  if (error) throw new Error(error.message);
  const posts = (data ?? []) as SocialPost[];
  const count = (s: string) => (counts ?? []).filter((c) => c.status === s).length;
  const connected = facebookConfigured();

  return (
    <div>
      <PageHeader
        title="Social"
        description="Posts for BetterBARMM's Facebook Page. Write one, submit it for review, and an approver sends it — now or at the time you set."
        actions={
          <>
            <span className={`pill ${connected ? "pill-good" : "pill-warn"}`} title={connected ? "Posting works" : "Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN on the admin"}>
              <FacebookLogoIcon size={12} weight="fill" aria-hidden="true" /> {connected ? "Facebook connected" : "Facebook not connected"}
            </span>
            <Link href="/social/new" className="btn btn-primary">
              <PlusIcon size={15} weight="bold" aria-hidden="true" /> New post
            </Link>
          </>
        }
      />

      <div className="mb-5 inline-flex flex-wrap rounded-lg bg-[var(--surface-2)] p-1">
        {TABS.map(([s, label]) => (
          <Link
            key={s}
            href={`/social?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition ${s === status ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)]" : "text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
          >
            {label}
            {s !== "all" && count(s) ? <span className="tabular-nums text-[var(--ink-mute)]">{count(s)}</span> : null}
          </Link>
        ))}
      </div>

      {posts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => {
            const image = p.image_path ? supabase.storage.from("social").getPublicUrl(p.image_path).data.publicUrl : null;
            const fb = p.results?.facebook;
            return (
              <Link key={p.id} href={`/social/${p.id}`} className="panel group flex flex-col overflow-hidden transition hover:-translate-y-px hover:shadow-[var(--shadow-md)]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="h-36 w-full object-cover" />
                ) : null}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`pill ${STATUS[p.status][1]}`}>{STATUS[p.status][0]}</span>
                    <span className="text-xs text-[var(--ink-mute)]">{ago(p.updated_at)}</span>
                  </div>
                  <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">{p.body}</p>
                  <p className="mt-3 text-xs text-[var(--ink-3)]">
                    {p.author_email || "unknown"}
                    {p.status === "scheduled" || (p.scheduled_at && p.status !== "posted") ? ` · for ${whenLabel(p.scheduled_at)}` : ""}
                    {p.status === "posted" && p.posted_at ? ` · ${whenLabel(p.posted_at)}` : ""}
                  </p>
                  {fb?.url ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                      On Facebook <ArrowSquareOutIcon size={12} aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={MegaphoneIcon} title={status === "in_review" ? "Nothing to review" : "No posts here"}>
            {status === "in_review" ? "Posts submitted for review wait here for an approver." : "Write one with New post."}
          </EmptyState>
        </div>
      )}
    </div>
  );
}
