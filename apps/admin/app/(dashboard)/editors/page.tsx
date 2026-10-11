import type { Profile } from "@betterbarmm/db";
import { revalidatePath } from "next/cache";
import { requireEditor } from "../../_lib/auth";

async function setRole(id: string, formData: FormData) {
  "use server";
  const { supabase, user } = await requireEditor("admin");
  const role = String(formData.get("role"));
  if (!["admin", "editor", "viewer"].includes(role)) throw new Error("Unknown role.");
  // Demoting yourself could leave the CMS with no admin at all.
  if (id === user.id) throw new Error("You cannot change your own role.");
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/editors");
}

export default async function EditorsPage() {
  const { supabase, user } = await requireEditor("admin");
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw new Error(error.message);
  const profiles = (data ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Editors</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink-3)]">
          Invite people from Supabase → Authentication → Users. They appear here as viewers; give them the editor
          role to let them write, or admin to let them manage editors too.
        </p>
      </header>

      <div className="panel overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Since</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.email}
                  {p.id === user.id ? <span className="ml-2 pill">you</span> : null}
                </td>
                <td className="text-[var(--ink-3)]">{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  {p.id === user.id ? (
                    <span className="pill">{p.role}</span>
                  ) : (
                    <form action={setRole.bind(null, p.id)} className="flex gap-2">
                      <select name="role" defaultValue={p.role} className="field w-auto">
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="btn btn-secondary">
                        Save
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
