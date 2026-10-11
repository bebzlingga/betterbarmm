import type { Explainer, Revision } from "@betterbarmm/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../../_components/confirm-button";
import { HistoryPanel } from "../../../_components/history-panel";
import { requireEditor } from "../../../_lib/auth";
import { deleteExplainer } from "../actions";
import { ExplainerForm } from "../explainer-form";

export default async function EditExplainerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireEditor();
  const { id } = await params;
  const { saved } = await searchParams;
  const [{ data }, { data: history }] = await Promise.all([
    supabase.from("explainers").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("revisions")
      .select("*")
      .eq("explainer_id", id)
      .order("changed_at", { ascending: false })
      .limit(30),
  ]);
  if (!data) notFound();
  const explainer = data as Explainer;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/explainers" className="text-sm text-[var(--ink-3)] hover:underline">
            ← Explainers
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{explainer.title}</h1>
          {saved ? <p className="mt-1 text-sm text-[var(--positive)]">Saved.</p> : null}
        </div>
        <form action={deleteExplainer.bind(null, explainer.id)}>
          <ConfirmButton message={`Delete "${explainer.title}"? You can restore it later from Activity.`}>Delete</ConfirmButton>
        </form>
      </header>
      <ExplainerForm key={explainer.updated_at} explainer={explainer} />
      <HistoryPanel revisions={(history ?? []) as Revision[]} />
    </div>
  );
}
