import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const notice =
    error === "forbidden"
      ? "This account is not an editor. Ask an admin to give you access."
      : undefined;

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="eyebrow">BetterBARMM</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-[var(--ink-3)]">
          Editors are invited from the Supabase dashboard.
        </p>
        <div className="mt-8">
          <LoginForm notice={notice} />
        </div>
      </div>
    </main>
  );
}
