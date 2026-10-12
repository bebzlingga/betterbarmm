import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const notice =
    error === "forbidden"
      ? "This account is not an editor yet. Ask an admin to give you access."
      : undefined;

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* The estate's mark and what this is for; hidden on a phone. */}
      <section className="relative hidden overflow-hidden bg-[#7f2216] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-white/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-black/10" aria-hidden="true" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-white font-[family-name:var(--font-display)] text-base font-bold text-[#7f2216]">B</span>
          <span className="font-[family-name:var(--font-display)] text-[17px] font-semibold">
            BetterBARMM <span className="font-normal text-white/70">Admin</span>
          </span>
        </div>
        <div className="relative max-w-md">
          <p className="font-[family-name:var(--font-display)] text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em]">
            Keep the public record current.
          </p>
          <p className="mt-4 text-[15px] leading-7 text-white/75">
            Review what changed at Parliament and PhilGEPS overnight, edit the records behind every workspace, and publish explainers.
          </p>
        </div>
        <p className="relative text-xs text-white/50">For BetterBARMM editors only.</p>
      </section>

      <section className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--accent)] font-[family-name:var(--font-display)] text-base font-bold text-[var(--accent-ink)]">B</span>
            <span className="font-[family-name:var(--font-display)] text-[17px] font-semibold">BetterBARMM Admin</span>
          </div>
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em]">Sign in</h1>
          <p className="mt-2 text-sm text-[var(--ink-3)]">With the email and password an admin set up for you.</p>
          <div className="mt-8">
            <LoginForm notice={notice} />
          </div>
        </div>
      </section>
    </main>
  );
}
