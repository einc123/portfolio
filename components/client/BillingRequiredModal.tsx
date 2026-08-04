"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { logoutAction } from "@/app/client/actions";
import {
  BillingDetailsForm,
  type BillingFormValues,
} from "@/components/client/BillingDetailsForm";

export function BillingRequiredModal({
  defaults,
}: {
  defaults: BillingFormValues;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-required-title"
    >
      <div className="absolute inset-0 bg-[#050807]/72" aria-hidden />

      <div className="billing-required-modal relative z-[1] flex max-h-[min(92svh,40rem)] w-full max-w-lg flex-col overflow-hidden border border-line sm:mx-4">
        <div className="shrink-0 border-b border-line px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Required
          </p>
          <h2
            id="billing-required-title"
            className="mt-2 font-display text-[clamp(1.75rem,6vw,2.5rem)] italic leading-[1.05] text-ink"
          >
            Set up billing details.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Add your billing name and address to unlock the client dashboard.
            You can update these later from your profile.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <BillingDetailsForm
            defaults={defaults}
            required
            onSuccess={() => setOpen(false)}
          />
        </div>

        <div className="shrink-0 border-t border-line px-5 py-4 sm:px-6">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-muted link-underline transition-colors hover:text-ink"
            >
              Sign out instead
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
