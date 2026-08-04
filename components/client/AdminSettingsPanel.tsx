"use client";

import { useActionState } from "react";
import {
  adminUpdateHourlyRate,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function AdminSettingsPanel({
  hourlyRatePounds,
}: {
  hourlyRatePounds: string;
}) {
  const [state, action, pending] = useActionState(
    adminUpdateHourlyRate,
    initial,
  );

  return (
    <section className="border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-2xl italic text-ink">Rates</h2>
      <p className="mt-2 text-sm text-muted">
        Shown to clients when they raise a maintenance request without an
        active maintenance subscription.
      </p>

      <form action={action} className="mt-6 max-w-sm space-y-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Hourly rate (GBP)
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted">£</span>
            <input
              name="hourlyRatePounds"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={hourlyRatePounds}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/50"
            />
          </div>
        </label>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state.ok ? (
          <p className="text-sm text-accent">
            {state.message?.trim() || "Hourly rate updated."}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save hourly rate"}
        </button>
      </form>
    </section>
  );
}
