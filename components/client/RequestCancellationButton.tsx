"use client";

import { useActionState, useEffect } from "react";
import {
  requestSubscriptionCancellation,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function RequestCancellationButton({
  subscriptionId,
  subscriptionLabel,
  amountLabel,
  status,
}: {
  subscriptionId: string;
  subscriptionLabel: string;
  amountLabel?: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(
    requestSubscriptionCancellation,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      // Keep success message visible after refresh isn't needed —
      // action state persists until next submit.
    }
  }, [state.ok]);

  if (state.ok) {
    return (
      <p className="mt-2 text-sm text-accent">
        {state.message?.trim() ||
          "Euan Livingstone will be in touch about your cancellation request."}
      </p>
    );
  }

  return (
    <form action={action} className="mt-2 space-y-2">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="subscriptionLabel" value={subscriptionLabel} />
      <input type="hidden" name="amountLabel" value={amountLabel ?? ""} />
      <input type="hidden" name="status" value={status} />
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-9 border border-line px-3 text-xs text-ink transition-colors hover:border-accent/40 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request cancellation"}
      </button>
    </form>
  );
}
