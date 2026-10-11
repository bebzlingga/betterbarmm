import { findCollection } from "@betterbarmm/db";
import { requireEditor } from "../../../../../_lib/auth";

const PAGE = 1000;

/** The whole collection as a JSON array, in file order — the same items its dataset file holds. */
export async function GET(_request: Request, { params }: { params: Promise<{ workspace: string; collection: string }> }) {
  const { supabase } = await requireEditor();
  const { workspace, collection } = await params;
  if (!findCollection(workspace, collection)) return new Response("Unknown collection.", { status: 404 });

  const items: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("records")
      .select("data")
      .eq("workspace", workspace)
      .eq("collection", collection)
      .order("position")
      .order("key")
      .range(from, from + PAGE - 1);
    if (error) return new Response(error.message, { status: 500 });
    items.push(...(data ?? []).map((row) => row.data));
    if (!data || data.length < PAGE) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(items, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${workspace}-${collection}-${date}.json"`,
    },
  });
}
