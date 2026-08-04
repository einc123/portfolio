"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  cancelOrgMaintenanceAtPeriodEnd,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function CancelMaintenanceButton({
  subscriptionId,
  periodEndLabel,
}: {
  subscriptionId: string;
  periodEndLabel?: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    cancelOrgMaintenanceAtPeriodEnd,
    initial,
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <p className="mt-3 text-sm text-accent">
        {state.message?.trim() ||
          "Maintenance will cancel at the end of the current billing period."}
      </p>
    );
  }

  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      {state.error ? (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40 disabled:opacity-60"
      >
        {pending
          ? "Scheduling…"
          : periodEndLabel
            ? `Cancel at end of billing (${periodEndLabel})`
            : "Cancel at end of billing period"}
      </button>
    </form>
  );
}
