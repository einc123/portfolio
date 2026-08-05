"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  confirmDefaultPaymentMethod,
  createPaymentMethodSetupSession,
} from "@/app/client/actions";
import {
  buildStripeAppearance,
  subscribeThemeChange,
} from "@/lib/stripe/appearance";

export type CurrentCardSummary = {
  brand: string | null;
  last4: string | null;
  expMonth?: number | null;
  expYear?: number | null;
};

type Props = {
  /** Forced onboarding style (modal) vs profile update */
  required?: boolean;
  onSuccess?: () => void;
  currentCard?: CurrentCardSummary | null;
};

function brandLabel(brand: string | null | undefined) {
  if (!brand) return "Card";
  const known: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
  };
  return known[brand.toLowerCase()] || brand.replaceAll("_", " ");
}

function formatExpiry(month?: number | null, year?: number | null) {
  if (!month || !year) return null;
  return `${String(month).padStart(2, "0")} / ${String(year).slice(-2)}`;
}

function useStripeAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(() =>
    buildStripeAppearance(),
  );
  const [appearanceKey, setAppearanceKey] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setAppearance(buildStripeAppearance());
      setAppearanceKey((key) => key + 1);
    };
    refresh();
    return subscribeThemeChange(refresh);
  }, []);

  return { appearance, appearanceKey };
}

export function LinkedCardPreview({ card }: { card: CurrentCardSummary }) {
  const expiry = formatExpiry(card.expMonth, card.expYear);

  return (
    <div className="relative overflow-hidden border border-line bg-band px-5 py-5 text-white sm:px-6 sm:py-6">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/35 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
            Card on file
          </p>
          <p className="mt-3 font-display text-2xl italic tracking-wide">
            {brandLabel(card.brand)}
          </p>
          <p className="mt-4 font-mono text-lg tracking-[0.18em] text-white/90">
            ···· ···· ···· {card.last4 || "····"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
            Expires
          </p>
          <p className="mt-2 tabular-nums text-sm text-white/85">
            {expiry || "—"}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-white/45">
            Default for subscriptions
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodInner({
  required,
  onSuccess,
  hasCard,
}: {
  required?: boolean;
  onSuccess?: () => void;
  hasCard?: boolean;
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="stripe-payment-element overflow-hidden">
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            paymentMethodOrder: ["card"],
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                phone: "never",
                address: "never",
              },
            },
          }}
        />
      </div>
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
            : hasCard
              ? "Replace card"
              : "Save card"}
      </button>
    </form>
  );
}

function StripeCardElements({
  clientSecret,
  stripePromise,
  appearance,
  appearanceKey,
  required,
  onSuccess,
  hasCard,
}: {
  clientSecret: string;
  stripePromise: Promise<Stripe | null>;
  appearance: Appearance;
  appearanceKey: number;
  required?: boolean;
  onSuccess?: () => void;
  hasCard?: boolean;
}) {
  return (
    <Elements
      key={appearanceKey}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
        loader: "auto",
        fonts: [
          {
            cssSrc:
              "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap",
          },
        ],
      }}
    >
      <PaymentMethodInner
        required={required}
        onSuccess={onSuccess}
        hasCard={hasCard}
      />
    </Elements>
  );
}

export function PaymentMethodForm({ required, onSuccess, currentCard }: Props) {
  const hasCard = Boolean(currentCard?.last4);
  const [showForm, setShowForm] = useState(required || !hasCard);
  const [bootError, setBootError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { appearance, appearanceKey } = useStripeAppearance();

  useEffect(() => {
    setShowForm(required || !hasCard);
  }, [required, hasCard]);

  useEffect(() => {
    if (!showForm) return;

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
  }, [showForm]);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey) as Promise<Stripe | null>;
  }, [publishableKey]);

  if (required) {
    if (loading && !clientSecret) {
      return <p className="text-sm text-muted">Loading secure card form…</p>;
    }
    if (bootError || !clientSecret || !stripePromise) {
      return (
        <p className="text-sm text-red-600">
          {bootError || "Card form unavailable."}
        </p>
      );
    }
    return (
      <StripeCardElements
        clientSecret={clientSecret}
        stripePromise={stripePromise}
        appearance={appearance}
        appearanceKey={appearanceKey}
        required
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="mt-5 space-y-5">
      {hasCard && currentCard ? <LinkedCardPreview card={currentCard} /> : null}

      {!hasCard ? (
        <div className="border border-dashed border-line bg-background px-4 py-4">
          <p className="text-sm text-muted">
            No subscription card on file yet. Add one below so maintenance and
            other renewals can charge securely through Stripe.
          </p>
        </div>
      ) : null}

      {hasCard && !showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-sm text-ink transition-colors hover:border-accent/40"
        >
          Replace card
        </button>
      ) : null}

      {showForm ? (
        <div className="border border-line bg-background px-4 py-5 sm:px-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
                {hasCard ? "Replace card" : "Add card"}
              </p>
              <p className="mt-1 text-sm text-muted">
                Entered securely in Stripe. Card details never touch this
                server.
              </p>
            </div>
            {hasCard ? (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-accent link-underline"
              >
                Cancel
              </button>
            ) : null}
          </div>

          {loading && !clientSecret ? (
            <p className="text-sm text-muted">Loading secure card form…</p>
          ) : null}

          {bootError || (!loading && (!clientSecret || !stripePromise)) ? (
            <p className="text-sm text-red-600">
              {bootError || "Card form unavailable."}
            </p>
          ) : null}

          {clientSecret && stripePromise ? (
            <StripeCardElements
              clientSecret={clientSecret}
              stripePromise={stripePromise}
              appearance={appearance}
              appearanceKey={appearanceKey}
              required={required}
              onSuccess={onSuccess}
              hasCard={hasCard}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
