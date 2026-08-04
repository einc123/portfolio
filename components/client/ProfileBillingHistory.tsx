import { RequestCancellationButton } from "@/components/client/RequestCancellationButton";
import type {
  PortalInvoice,
  PortalPayment,
  PortalSubscription,
} from "@/lib/stripe/billing";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function amountLabelFor(sub: PortalSubscription) {
  if (sub.amount == null || !sub.currency) return undefined;
  return `${money(sub.amount, sub.currency)}${sub.interval ? ` / ${sub.interval}` : ""}`;
}

export function ProfileBillingHistory({
  linked,
  invoices,
  payments,
  subscriptions,
  error,
}: {
  linked: boolean;
  invoices: PortalInvoice[];
  payments: PortalPayment[];
  subscriptions: PortalSubscription[];
  error?: string | null;
}) {
  return (
    <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-2xl italic text-ink">
        Invoices &amp; payments
      </h2>
      <p className="mt-2 text-sm text-muted">
        {linked
          ? "Pulled from your linked Stripe customer."
          : "No Stripe customer is linked to this account yet. Ask an admin to create or assign one."}
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-600">
          Couldn’t load Stripe history: {error}
        </p>
      ) : null}

      {linked ? (
        <div className="mt-6 space-y-8">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Invoices
            </h3>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No invoices on this Stripe customer yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border border-line bg-background">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="px-4 py-3 text-sm text-ink">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {invoice.number || invoice.id}
                      </span>
                      <span className="capitalize text-muted">
                        {invoice.status || "unknown"}
                      </span>
                    </div>
                    <p className="mt-1 text-muted">
                      {money(invoice.amountDue, invoice.currency)} ·{" "}
                      {formatDate(invoice.created)}
                      {invoice.description ? ` · ${invoice.description}` : ""}
                    </p>
                    {invoice.hostedInvoiceUrl ? (
                      <a
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-accent link-underline"
                      >
                        Open invoice
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Payments
            </h3>
            {payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No payments on this Stripe customer yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border border-line bg-background">
                {payments.map((payment) => (
                  <li key={payment.id} className="px-4 py-3 text-sm text-ink">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {money(payment.amount, payment.currency)}
                      </span>
                      <span className="capitalize text-muted">
                        {payment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-muted">
                      {formatDate(payment.created)}
                      {payment.description ? ` · ${payment.description}` : ""}
                    </p>
                    {payment.receiptUrl ? (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-accent link-underline"
                      >
                        Receipt
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Subscriptions
            </h3>
            {subscriptions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No subscriptions on this Stripe customer yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border border-line bg-background">
                {subscriptions.map((sub) => {
                  const label = sub.productName || sub.id;
                  const amountLabel = amountLabelFor(sub);
                  const canRequest =
                    sub.status !== "canceled" && !sub.cancelAtPeriodEnd;

                  return (
                    <li key={sub.id} className="px-4 py-3 text-sm text-ink">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">{label}</span>
                        <span className="capitalize text-muted">
                          {sub.status}
                        </span>
                      </div>
                      <p className="mt-1 text-muted">
                        {amountLabel || sub.id}
                        {sub.paused ? " · Paused" : ""}
                        {sub.cancelAtPeriodEnd
                          ? " · Cancels at period end"
                          : ""}
                        {sub.currentPeriodEnd
                          ? ` · Period ends ${formatDate(sub.currentPeriodEnd)}`
                          : ""}
                      </p>
                      {canRequest ? (
                        <RequestCancellationButton
                          subscriptionId={sub.id}
                          subscriptionLabel={label}
                          amountLabel={amountLabel}
                          status={sub.status}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
