"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminAssignStripeCustomer,
  adminAssignStripeObject,
  adminCreateStripeCustomer,
  adminRemoveStripeCustomer,
  type ActionState,
} from "@/app/client/actions";
import type {
  PortalInvoice,
  PortalPayment,
  PortalSubscription,
} from "@/lib/stripe/billing";

const initial: ActionState = {};

type OrgOption = { id: number; name: string };

function useRefreshOnSuccess(state: ActionState) {
  const router = useRouter();
  const lastOk = useRef(false);
  useEffect(() => {
    if (state.ok && !lastOk.current) router.refresh();
    lastOk.current = Boolean(state.ok);
  }, [state.ok, router]);
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.ok) {
    return (
      <p className="text-sm text-accent">
        {state.message?.trim() || "Saved."}
      </p>
    );
  }
  return null;
}

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

export function AdminUserStripeSection({
  userId,
  stripeCustomerId,
  organisations,
  billing,
}: {
  userId: number;
  stripeCustomerId: string | null;
  organisations: OrgOption[];
  billing: {
    invoices: PortalInvoice[];
    payments: PortalPayment[];
    subscriptions: PortalSubscription[];
  } | null;
}) {
  const [createState, createAction, createPending] = useActionState(
    adminCreateStripeCustomer,
    initial,
  );
  const [assignState, assignAction, assignPending] = useActionState(
    adminAssignStripeCustomer,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    adminRemoveStripeCustomer,
    initial,
  );
  const [linkState, linkAction, linkPending] = useActionState(
    adminAssignStripeObject,
    initial,
  );

  useRefreshOnSuccess(createState);
  useRefreshOnSuccess(assignState);
  useRefreshOnSuccess(removeState);
  useRefreshOnSuccess(linkState);

  const [assignId, setAssignId] = useState("");

  return (
    <section className="border-t border-line pt-6">
      <h2 className="font-display text-xl italic text-ink">Stripe customer</h2>
      <p className="mt-2 text-sm text-muted">
        Link a Stripe customer so billing details sync and invoices can be
        assigned to organisations.
      </p>

      {stripeCustomerId ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-ink">
            Linked:{" "}
            <a
              href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-accent"
            >
              {stripeCustomerId}
            </a>
          </p>

          <form action={removeAction} className="flex flex-wrap items-center gap-4">
            <input type="hidden" name="userId" value={userId} />
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input name="deleteInStripe" type="checkbox" className="h-4 w-4" />
              Also delete customer in Stripe
            </label>
            <Feedback state={removeState} />
            <button
              type="submit"
              disabled={removePending}
              className="inline-flex min-h-10 items-center border border-line px-4 text-sm disabled:opacity-60"
            >
              {removePending ? "Removing…" : "Unlink Stripe customer"}
            </button>
          </form>

          <div className="border-t border-line pt-4">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Assign to organisation
            </h3>
            <p className="mt-2 text-sm text-muted">
              Paste an invoice, subscription, payment intent, or charge id from
              this customer.
            </p>
            <form action={linkAction} className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                name="stripeObjectId"
                required
                placeholder="in_… / sub_… / pi_… / ch_…"
                className="border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent sm:col-span-2"
              />
              <select
                name="organisationId"
                required
                defaultValue=""
                className="border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              >
                <option value="" disabled>
                  Organisation…
                </option>
                {organisations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={linkPending || organisations.length === 0}
                className="inline-flex min-h-11 items-center justify-center border border-line px-4 text-sm disabled:opacity-60"
              >
                {linkPending ? "Assigning…" : "Assign to organisation"}
              </button>
              <div className="sm:col-span-2">
                <Feedback state={linkState} />
              </div>
            </form>
          </div>

          {billing ? (
            <div className="space-y-5 border-t border-line pt-4">
              <BillingLists
                invoices={billing.invoices}
                payments={billing.payments}
                subscriptions={billing.subscriptions}
                compact
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <form action={createAction} className="space-y-3">
            <input type="hidden" name="userId" value={userId} />
            <p className="text-sm text-muted">
              Create a new Stripe customer for this portal account.
            </p>
            <Feedback state={createState} />
            <button
              type="submit"
              disabled={createPending}
              className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
            >
              {createPending ? "Creating…" : "Create Stripe customer"}
            </button>
          </form>

          <form action={assignAction} className="space-y-3">
            <input type="hidden" name="userId" value={userId} />
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Existing Stripe customer id
              </span>
              <input
                name="stripeCustomerId"
                value={assignId}
                onChange={(event) => setAssignId(event.target.value)}
                placeholder="cus_…"
                required
                className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              />
            </label>
            <Feedback state={assignState} />
            <button
              type="submit"
              disabled={assignPending}
              className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
            >
              {assignPending ? "Linking…" : "Assign Stripe customer"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export function BillingLists({
  invoices,
  payments,
  subscriptions,
  compact = false,
}: {
  invoices: PortalInvoice[];
  payments: PortalPayment[];
  subscriptions: PortalSubscription[];
  compact?: boolean;
}) {
  const titleClass = compact
    ? "text-[11px] uppercase tracking-[0.16em] text-faint"
    : "font-display text-xl italic text-ink";

  return (
    <div className="space-y-6">
      <div>
        <h3 className={titleClass}>Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border border-line bg-background">
            {subscriptions.map((sub) => (
              <li key={sub.id} className="px-4 py-3 text-sm text-ink">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {sub.productName || sub.id}
                  </span>
                  <span className="text-muted capitalize">{sub.status}</span>
                </div>
                <p className="mt-1 text-muted">
                  {sub.amount != null && sub.currency
                    ? `${money(sub.amount, sub.currency)}${sub.interval ? ` / ${sub.interval}` : ""}`
                    : sub.id}
                  {sub.paused ? " · Paused" : ""}
                  {sub.cancelAtPeriodEnd ? " · Cancels at period end" : ""}
                  {sub.currentPeriodEnd
                    ? ` · Period ends ${formatDate(sub.currentPeriodEnd)}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className={titleClass}>Invoices</h3>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border border-line bg-background">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="px-4 py-3 text-sm text-ink">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {invoice.number || invoice.id}
                  </span>
                  <span className="text-muted capitalize">
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
        <h3 className={titleClass}>Payments</h3>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border border-line bg-background">
            {payments.map((payment) => (
              <li key={payment.id} className="px-4 py-3 text-sm text-ink">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {money(payment.amount, payment.currency)}
                  </span>
                  <span className="text-muted capitalize">{payment.status}</span>
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
    </div>
  );
}
