"use client";

import { useState, useTransition } from "react";
import { createStripePortalSession } from "@/app/client/actions";

export function StripePortalButton({
  label = "Open Stripe billing",
}: {
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openPortal() {
    setError(null);
    startTransition(async () => {
      const result = await createStripePortalSession();
      if (!result.ok || !result.url) {
        setError(result.error || "Could not open Stripe.");
        return;
      }
      window.location.assign(result.url);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-accent px-6 py-2.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Opening Stripe…" : label}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
