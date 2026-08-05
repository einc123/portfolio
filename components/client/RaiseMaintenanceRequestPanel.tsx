"use client";

import { useActionState } from "react";
import {
  requestMaintenanceSupport,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function RaiseMaintenanceRequestPanel({
  hasActiveMaintenance,
  coverageKind = "none",
  hourlyRateLabel,
  subscriptionId,
}: {
  hasActiveMaintenance: boolean;
  coverageKind?: "stripe" | "included" | "none";
  hourlyRateLabel: string;
  subscriptionId?: string | null;
}) {
  const [state, action, pending] = useActionState(
    requestMaintenanceSupport,
    initial,
  );

  if (state.ok) {
    return (
      <section className="border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Maintenance request
        </h2>
        <p className="mt-3 text-sm text-accent">
          {state.message?.trim() ||
            "Your maintenance request has been sent. Euan Livingstone will be in touch."}
        </p>
      </section>
    );
  }

  return (
    <section className="border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
        Raise a maintenance request
      </h2>

      {coverageKind === "stripe" ||
      (hasActiveMaintenance && coverageKind !== "included") ? (
        <p className="mt-3 text-sm leading-relaxed text-ink">
          You have an active maintenance subscription. If your request falls
          under maintenance as specified in the Maintenance Subscription
          Contract, it will be handled under that subscription. Work outside
          the contract scope may be quoted separately.
        </p>
      ) : coverageKind === "included" ? (
        <p className="mt-3 text-sm leading-relaxed text-ink">
          You have a maintenance plan already included for this organisation.
          If your request falls under maintenance as specified in the
          Maintenance Subscription Contract, it will be handled under that plan.
          Work outside the contract scope may be quoted separately.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-ink">
          You don&apos;t have an active maintenance plan. Any requested
          maintenance is subject to hourly rates, which are currently{" "}
          <span className="font-medium">{hourlyRateLabel}</span> per hour
          (plus any agreed materials or third-party costs).
        </p>
      )}

      <form action={action} className="mt-5 space-y-4">
        {subscriptionId ? (
          <input type="hidden" name="subscriptionId" value={subscriptionId} />
        ) : null}
        <input
          type="hidden"
          name="hasActiveMaintenance"
          value={hasActiveMaintenance ? "1" : "0"}
        />
        <input type="hidden" name="coverageKind" value={coverageKind} />

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Subject
          </span>
          <input
            name="subject"
            required
            maxLength={160}
            placeholder="Brief summary of the issue or change"
            className="mt-2 w-full border border-line bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/50"
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Details
          </span>
          <textarea
            name="details"
            required
            rows={5}
            maxLength={5000}
            placeholder="What needs doing, where it appears, and any urgency"
            className="mt-2 w-full resize-y border border-line bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/50"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send maintenance request"}
        </button>
      </form>
    </section>
  );
}
