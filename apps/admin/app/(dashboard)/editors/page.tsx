import type { Profile } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { PageHeader, ago, initials } from "../../_components/ui";
import { requireEditor } from "../../_lib/auth";

async function setRole(id: string, formData: FormData) {
  "use server";
  const { supabase, user } = await requireEditor("admin");
  const role = String(formData.get("role"));
  if (!["admin", "editor", "viewer"].includes(role)) throw new Error("Unknown role.");
  // Demoting yourself could leave the CMS with no admin at all.
  if (id === user.id) throw new Error("You cannot change your own role.");
  const { error } = await supabase
    .from("profiles")
    .update({ role, can_approve_posts: formData.get("can_approve_posts") === "on" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/editors");
}

export default async function EditorsPage() {
  const { supabase, user } = await requireEditor("admin");
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw new Error(error.message);
  const profiles = (data ?? []) as Profile[];

  const roleNote = { admin: "Manages editors; approves posts", editor: "Edits records and updates", viewer: "Cannot sign in to the dashboard" } as const;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Settings" }]}
        title="Editors"
        description={
          <>
            Add people in Supabase → Authentication → Users → <strong className="font-medium text-[var(--ink-2)]">Create new user</strong>, with a
            password. They appear here as viewers; make them editors to write and approve updates, or admins to manage editors too. Tick “Approves posts” for anyone who may send social posts out.
          </>
        }
      />

      <div className="panel overflow-hidden">
        <ul className="divide-y divide-[var(--rule)]">
          {profiles.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-[1.125rem] py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--surface-3)] font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold text-[var(--ink-2)]">
                {initials(p.name || p.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {p.name || p.email}
                  {p.id === user.id ? <span className="pill pill-accent">You</span> : null}
                </p>
                <p className="text-xs text-[var(--ink-3)]">
                  {p.name ? `${p.email} · ` : ""}joined {ago(p.created_at)}
                </p>
              </div>
              {p.id === user.id ? (
                <span className="text-right text-xs text-[var(--ink-3)]">
                  <span className="pill capitalize">{p.role}</span>
                  <span className="mt-1 block">{roleNote[p.role]}</span>
                </span>
              ) : (
                <form action={setRole.bind(null, p.id)} className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-[0.8125rem] text-[var(--ink-2)]" title="May approve social posts before they go to Facebook">
                    <input type="checkbox" name="can_approve_posts" defaultChecked={Boolean(p.can_approve_posts)} className="size-4 accent-[var(--accent)]" />
                    Approves posts
                  </label>
                  <select name="role" defaultValue={p.role} className="field !w-auto">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="btn btn-secondary">Save</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
