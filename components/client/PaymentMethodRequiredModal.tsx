"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { logoutAction } from "@/app/client/actions";
import { PaymentMethodForm } from "@/components/client/PaymentMethodForm";

export function PaymentMethodRequiredModal() {
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
      aria-labelledby="payment-method-required-title"
    >
      <div className="absolute inset-0 bg-[#050807]/72" aria-hidden />

      <div className="billing-required-modal relative z-[1] flex max-h-[min(92svh,44rem)] w-full max-w-lg flex-col overflow-hidden border border-line sm:mx-4">
        <div className="shrink-0 border-b border-line px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Required
          </p>
          <h2
            id="payment-method-required-title"
            className="mt-2 font-display text-[clamp(1.75rem,6vw,2.5rem)] italic leading-[1.05] text-ink"
          >
            Add a card for subscriptions.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Save a bank card on Stripe for maintenance and other subscriptions.
            This stays on your account — you can change it later from your
            profile.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-5 py-5 sm:px-6 sm:py-6">
          <PaymentMethodForm
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
