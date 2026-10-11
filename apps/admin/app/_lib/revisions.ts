import { findCollection, workspaceLabel, type Revision } from "@betterbarmm/db";

/** Where a revision's record or explainer lives in the admin. */
export function revisionHref(r: Revision) {
  return r.entity === "explainer"
    ? `/explainers/${r.explainer_id}`
    : `/data/${r.workspace}/${r.collection}/edit?key=${encodeURIComponent(r.key ?? "")}`;
}

export function revisionPlace(r: Revision) {
  if (r.entity === "explainer") return "Explainer";
  const def = findCollection(r.workspace ?? "", r.collection ?? "");
  return `${workspaceLabel(r.workspace ?? "")} / ${def?.label ?? r.collection}`;
}
