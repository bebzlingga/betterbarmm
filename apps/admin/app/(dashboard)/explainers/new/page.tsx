import { PageHeader } from "../../../_components/ui";
import { requireEditor } from "../../../_lib/auth";
import { ExplainerForm } from "../explainer-form";

export default async function NewExplainerPage() {
  await requireEditor();
  return (
    <div>
      <PageHeader crumbs={[{ label: "Explainers", href: "/explainers" }]} title="New explainer" description="Saved as a draft until you set it to published." />
      <ExplainerForm />
    </div>
  );
}
