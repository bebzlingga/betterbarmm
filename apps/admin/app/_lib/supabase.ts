import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * A client acting as the signed-in editor, so row-level security applies to
 * every query exactly as it would for them.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          // A Server Component cannot write cookies; the proxy refreshes the
          // session on the next request instead.
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
