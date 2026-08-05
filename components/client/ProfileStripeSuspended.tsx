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
    }
  }

  return (
    <>
      {billingReady ? (
        <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
          <h2 className="font-display text-2xl italic text-ink">
            Subscription card
          </h2>
          <p className="mt-2 text-sm text-muted">
            Bank card used for maintenance and other Stripe subscriptions. Saved
            securely with Stripe — not stored on this site.
          </p>
          <PaymentMethodForm
            currentCard={
              cardSummary?.hasPaymentMethod
                ? { brand: cardSummary.brand, last4: cardSummary.last4 }
                : null
            }
          />
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
