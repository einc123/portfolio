import { Suspense } from "react";
import { PaymentMethodForm } from "@/components/client/PaymentMethodForm";
import { ProfileBillingHistory } from "@/components/client/ProfileBillingHistory";
import {
  getCustomerPaymentMethodSummary,
  listCustomerBilling,
} from "@/lib/stripe/billing";
import { withTimeout } from "@/lib/withTimeout";

function BillingSkeleton({ label }: { label: string }) {
  return (
    <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
      <p className="text-sm text-muted">{label}</p>
    </section>
  );
}

async function ProfileStripeSections({
  customerId,
  billingReady,
}: {
  customerId: string | null;
  billingReady: boolean;
}) {
  let customerBilling: Awaited<ReturnType<typeof listCustomerBilling>> = {
    invoices: [],
    payments: [],
    subscriptions: [],
    error: null,
  };
  let cardSummary: Awaited<
    ReturnType<typeof getCustomerPaymentMethodSummary>
  > | null = null;
  let cardLoadError: string | null = null;

  if (customerId) {
    const [billingSettled, cardSettled] = await Promise.allSettled([
      withTimeout(listCustomerBilling(customerId), 15_000),
      withTimeout(getCustomerPaymentMethodSummary(customerId), 10_000),
    ]);

    if (billingSettled.status === "fulfilled") {
      customerBilling = billingSettled.value;
    } else {
      const reason = billingSettled.reason;
      customerBilling = {
        invoices: [],
        payments: [],
        subscriptions: [],
        error:
          reason instanceof Error
            ? /timed out/i.test(reason.message)
              ? "Stripe took too long — try refreshing."
              : reason.message
            : "Stripe request failed.",
      };
    }

    if (cardSettled.status === "fulfilled") {
      cardSummary = cardSettled.value;
    } else {
      const reason = cardSettled.reason;
      cardLoadError =
        reason instanceof Error
          ? /timed out/i.test(reason.message)
            ? "Couldn’t load your card from Stripe in time — try refreshing."
            : reason.message
          : "Couldn’t load card details from Stripe.";
    }
  }

  const currentCard =
    cardSummary?.hasPaymentMethod && cardSummary.last4
      ? {
          brand: cardSummary.brand,
          last4: cardSummary.last4,
          expMonth: cardSummary.expMonth,
          expYear: cardSummary.expYear,
        }
      : null;

  return (
    <>
      {billingReady ? (
        <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl italic text-ink">
                Subscription card
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                The bank card used for maintenance and other Stripe
                subscriptions. Stored with Stripe — never on this site.
              </p>
            </div>
            {currentCard ? (
              <p className="text-[11px] uppercase tracking-[0.14em] text-accent">
                Linked
              </p>
            ) : (
              <p className="text-[11px] uppercase tracking-[0.14em] text-faint">
                Not linked
              </p>
            )}
          </div>

          {cardLoadError ? (
            <p className="mt-4 text-sm text-red-600">{cardLoadError}</p>
          ) : null}

          {!customerId ? (
            <p className="mt-5 text-sm text-muted">
              A Stripe customer needs to be linked before you can save a card.
              Ask an admin if this is missing.
            </p>
          ) : (
            <PaymentMethodForm currentCard={currentCard} />
          )}
        </section>
      ) : null}

      <ProfileBillingHistory
        linked={Boolean(customerId)}
        invoices={customerBilling.invoices}
        payments={customerBilling.payments}
        subscriptions={customerBilling.subscriptions}
        error={customerBilling.error}
      />
    </>
  );
}

export function ProfileStripeSuspended({
  customerId,
  billingReady,
}: {
  customerId: string | null;
  billingReady: boolean;
}) {
  return (
    <Suspense
      fallback={<BillingSkeleton label="Loading billing from Stripe…" />}
    >
      <ProfileStripeSections
        customerId={customerId}
        billingReady={billingReady}
      />
    </Suspense>
  );
}
