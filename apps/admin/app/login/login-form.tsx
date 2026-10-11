"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="field-label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
        />
      </label>
      {error || notice ? (
        <p role="alert" className="text-sm text-[var(--accent)]">
          {error ?? notice}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
