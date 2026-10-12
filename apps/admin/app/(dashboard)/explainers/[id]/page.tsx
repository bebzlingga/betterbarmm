import type { Explainer, Revision } from "@betterbarmm/db";
import { CheckCircleIcon, TrashIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { ConfirmButton } from "../../../_components/confirm-button";
import { HistoryPanel } from "../../../_components/history-panel";
import { PageHeader } from "../../../_components/ui";
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
    <div>
      <PageHeader
        crumbs={[{ label: "Explainers", href: "/explainers" }]}
        title={explainer.title}
        actions={
          <form action={deleteExplainer.bind(null, explainer.id)}>
            <ConfirmButton message={`Delete "${explainer.title}"? You can restore it later from Activity.`}>
              <TrashIcon size={15} aria-hidden="true" /> Delete
            </ConfirmButton>
          </form>
        }
      >
        {saved ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--good-soft)] px-3 py-2 text-sm text-[var(--good)]">
            <CheckCircleIcon size={16} weight="fill" aria-hidden="true" /> Saved.
          </p>
        ) : null}
      </PageHeader>
      <ExplainerForm key={explainer.updated_at} explainer={explainer} />
      <div className="mt-6">
        <HistoryPanel revisions={(history ?? []) as Revision[]} />
      </div>
    </div>
  );
}
