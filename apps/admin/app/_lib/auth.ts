import type { Profile } from "@betterbarmm/db";
import { redirect } from "next/navigation";
import { createClient } from "./supabase";

/**
 * The signed-in editor, or a redirect. Called by every dashboard page and
 * every Server Action — the proxy's redirect is only a convenience, and the
 * database's row-level security is the real gate behind both.
 */
export async function requireEditor(role: "editor" | "admin" = "editor") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const allowed = role === "admin" ? ["admin"] : ["admin", "editor"];
  if (!profile || !allowed.includes(profile.role)) redirect("/login?error=forbidden");

  return { supabase, user, profile };
}
