"use client";

import { RocketLaunchIcon } from "@phosphor-icons/react";
import { useActionState } from "react";
import { publishNow, type PublishState } from "./actions";

/** Starts the publish job now instead of at the top of the hour. */
export function PublishButton() {
  const [state, action, pending] = useActionState<PublishState, FormData>(() => publishNow(), { message: null, ok: false });
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <button type="submit" className="btn btn-secondary" disabled={pending}>
        <RocketLaunchIcon size={15} aria-hidden="true" />
        {pending ? "Starting…" : "Publish approved now"}
      </button>
      {state.message ? (
        <p className={`max-w-xs text-right text-xs ${state.ok ? "text-[var(--ink-2)]" : "text-[var(--ink-3)]"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
