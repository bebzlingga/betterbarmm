import { PageHeader } from "../../../_components/ui";
import { facebookPageName } from "../../../_lib/facebook";
import { requireEditor } from "../../../_lib/auth";
import { PostComposer } from "../post-composer";

export default async function NewPostPage() {
  await requireEditor();
  return (
    <div>
      <PageHeader crumbs={[{ label: "Social", href: "/social" }]} title="New post" description="Save it as a draft, or submit it for an approver to send." />
      <PostComposer imageUrl={null} pageName={facebookPageName()} />
    </div>
  );
}
