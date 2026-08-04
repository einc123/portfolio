"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  confirmDefaultPaymentMethod,
  createPaymentMethodSetupSession,
} from "@/app/client/actions";

type Props = {
  /** Forced onboarding style (modal) vs profile update */
  required?: boolean;
  onSuccess?: () => void;
  currentCard?: { brand: string | null; last4: string | null } | null;
};

function PaymentMethodInner({
  required,
  onSuccess,
}: {
  required?: boolean;
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setSubmitting(true);

    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url:
          typeof window !== "undefined"
            ? `${window.location.origin}/client/profile`
            : undefined,
      },
    });

    if (result.error) {
      setSubmitting(false);
      setError(result.error.message || "Could not save that card.");
      return;
    }

    const paymentMethodId =
      typeof result.setupIntent?.payment_method === "string"
        ? result.setupIntent.payment_method
        : result.setupIntent?.payment_method?.id;

    if (!paymentMethodId) {
      setSubmitting(false);
      setError("Stripe did not return a payment method.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("paymentMethodId", paymentMethodId);
      const saved = await confirmDefaultPaymentMethod({}, formData);
      setSubmitting(false);
      if (!saved.ok) {
        setError(saved.error || "Could not set the default card.");
        return;
      }
      onSuccess?.();
      router.refresh();
      if (required) {
        router.push("/client/dashboard");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className={required ? "space-y-4" : "mt-5 space-y-4"}>
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting || pending}
        className="inline-flex min-h-11 items-center justify-center bg-accent px-6 py-2.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {submitting || pending
          ? "Saving card…"
          : required
            ? "Save card and continue"
            : "Update card"}
      </button>
    </form>
  );
}

export function PaymentMethodForm({ required, onSuccess, currentCard }: Props) {
  const [bootError, setBootError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setBootError(null);
      const session = await createPaymentMethodSetupSession();
      if (cancelled) return;
      if (!session.ok || !session.clientSecret || !session.publishableKey) {
        setBootError(session.error || "Could not start card setup.");
        setLoading(false);
        return;
      }
      setClientSecret(session.clientSecret);
      setPublishableKey(session.publishableKey);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey) as Promise<Stripe | null>;
  }, [publishableKey]);

  if (loading) {
    return (
      <p className={required ? "text-sm text-muted" : "mt-5 text-sm text-muted"}>
        Loading secure card form…
      </p>
    );
  }

  if (bootError || !clientSecret || !stripePromise) {
    return (
      <p className={`text-sm text-red-600 ${required ? "" : "mt-5"}`}>
        {bootError || "Card form unavailable."}
      </p>
    );
  }

  return (
    <div className={required ? "" : "mt-5"}>
      {currentCard?.last4 ? (
        <p className="mb-4 text-sm text-muted">
          Current card on file:{" "}
          <span className="text-ink">
            {(currentCard.brand || "card").toUpperCase()} ···· {currentCard.last4}
          </span>
        </p>
      ) : null}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#0f5c4c",
              borderRadius: "0px",
              fontFamily: "inherit",
            },
          },
        }}
      >
        <PaymentMethodInner required={required} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
