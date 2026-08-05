import { Suspense } from "react";
import { ProfileBillingHistory } from "@/components/client/ProfileBillingHistory";
import { StripePortalButton } from "@/components/client/StripePortalButton";
import { listCustomerBilling } from "@/lib/stripe/billing";
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
  if (customerId) {
    try {
      customerBilling = await withTimeout(
        listCustomerBilling(customerId),
        15_000,
      );
    } catch (reason) {
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
  }

  return (
    <>
      {billingReady ? (
        <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
          <h2 className="font-display text-2xl italic text-ink">
            Payment details
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Stripe securely handles your available payment methods. Use its
            hosted billing page to review or update how subscriptions are paid.
          </p>

          {!customerId ? (
            <p className="mt-5 text-sm text-muted">
              A Stripe customer needs to be linked before payment details can
              be managed. Ask an admin if this is missing.
            </p>
          ) : (
            <div className="mt-5">
              <StripePortalButton />
            </div>
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
