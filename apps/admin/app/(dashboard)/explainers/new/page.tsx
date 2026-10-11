import Link from "next/link";
import { requireEditor } from "../../../_lib/auth";
import { ExplainerForm } from "../explainer-form";

export default async function NewExplainerPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/explainers" className="text-sm text-[var(--ink-3)] hover:underline">
          ← Explainers
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">New explainer</h1>
      </header>
      <ExplainerForm />
    </div>
  );
}
