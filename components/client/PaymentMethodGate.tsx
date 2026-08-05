"use client";

import { useEffect, useState } from "react";
import { checkDefaultPaymentMethodRequired } from "@/app/client/actions";
import { PaymentMethodRequiredModal } from "@/components/client/PaymentMethodRequiredModal";

/**
 * Runs the Stripe card check after the page paints so a slow/hung Stripe call
 * cannot block the whole /client layout (which made portal pages spin forever).
 */
export function PaymentMethodGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await checkDefaultPaymentMethodRequired();
        if (!cancelled && result.required) setShow(true);
      } catch {
        // Fail open — profile still has a card section.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;
  return <PaymentMethodRequiredModal />;
}
