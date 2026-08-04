"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  adminAssignStripeObject,
  adminCreateOrgInvoice,
  adminCreateOrgSubscription,
  adminManageSubscription,
  adminUnassignStripeObject,
  type ActionState,
} from "@/app/client/actions";
import type {
  PortalInvoice,
  PortalPayment,
  PortalSubscription,
} from "@/lib/stripe/billing";

const initial: ActionState = {};

type CustomerOption = {
  id: number;
  label: string;
  stripeCustomerId: string;
  hasBilling?: boolean;
};

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
  if (state.ok) return <p className="text-sm text-accent">Saved.</p>;
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

function SubscriptionManageList({
  subscriptions,
  emptyLabel,
  manageAction,
  managePending,
  unassignAction,
  unassignPending,
}: {
  subscriptions: PortalSubscription[];
  emptyLabel: string;
  manageAction: (payload: FormData) => void;
  managePending: boolean;
  unassignAction: (payload: FormData) => void;
  unassignPending: boolean;
}) {
  if (subscriptions.length === 0) {
    return <p className="mt-3 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {subscriptions.map((sub) => (
        <li
          key={sub.id}
          className="border border-line bg-background px-4 py-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-ink">
              {sub.productName || sub.id}
              {sub.kind === "maintenance" ? (
                <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-faint">
                  Maintenance
                </span>
              ) : null}
            </span>
            <span className="capitalize text-muted">{sub.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {sub.amount != null && sub.currency
              ? `${money(sub.amount, sub.currency)}${sub.interval ? ` / ${sub.interval}` : ""} · `
              : ""}
            {sub.paused ? "Paused · " : ""}
            {sub.cancelAtPeriodEnd ? "Cancels at period end · " : ""}
            {sub.currentPeriodEnd
              ? `Period ends ${formatDate(sub.currentPeriodEnd)} · `
              : ""}
            {sub.id}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!sub.paused && sub.status !== "canceled" ? (
              <form action={manageAction}>
                <input type="hidden" name="subscriptionId" value={sub.id} />
                <input type="hidden" name="action" value="pause" />
                <button
                  type="submit"
                  disabled={managePending}
                  className="min-h-9 border border-line px-3 text-xs disabled:opacity-60"
                >
                  Pause
                </button>
              </form>
            ) : null}
            {sub.paused ? (
              <form action={manageAction}>
                <input type="hidden" name="subscriptionId" value={sub.id} />
                <input type="hidden" name="action" value="resume" />
                <button
                  type="submit"
                  disabled={managePending}
                  className="min-h-9 border border-line px-3 text-xs disabled:opacity-60"
                >
                  Resume
                </button>
              </form>
            ) : null}
            {sub.status !== "canceled" && !sub.cancelAtPeriodEnd ? (
              <form action={manageAction}>
                <input type="hidden" name="subscriptionId" value={sub.id} />
                <input type="hidden" name="action" value="cancel_period_end" />
                <button
                  type="submit"
                  disabled={managePending}
                  className="min-h-9 border border-line px-3 text-xs disabled:opacity-60"
                >
                  Cancel at period end
                </button>
              </form>
            ) : null}
            {sub.status !== "canceled" ? (
              <form action={manageAction}>
                <input type="hidden" name="subscriptionId" value={sub.id} />
                <input type="hidden" name="action" value="cancel_now" />
                <button
                  type="submit"
                  disabled={managePending}
                  className="min-h-9 border border-line px-3 text-xs text-red-700 disabled:opacity-60"
                >
                  Cancel now
                </button>
              </form>
            ) : null}
            <form action={unassignAction}>
              <input type="hidden" name="stripeObjectId" value={sub.id} />
              <button
                type="submit"
                disabled={unassignPending}
                className="min-h-9 border border-line px-3 text-xs disabled:opacity-60"
              >
                Unassign from org
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminOrgBillingPanel({
  organisationId,
  customers,
  invoices,
  payments,
  subscriptions,
  loadError,
}: {
  organisationId: number;
  customers: CustomerOption[];
  invoices: PortalInvoice[];
  payments: PortalPayment[];
  subscriptions: PortalSubscription[];
  loadError?: string | null;
}) {
  const [invoiceState, invoiceAction, invoicePending] = useActionState(
    adminCreateOrgInvoice,
    initial,
  );
  const [subState, subAction, subPending] = useActionState(
    adminCreateOrgSubscription,
    initial,
  );
  const [maintenanceState, maintenanceAction, maintenancePending] =
    useActionState(adminCreateOrgSubscription, initial);
  const [assignState, assignAction, assignPending] = useActionState(
    adminAssignStripeObject,
    initial,
  );
  const [manageState, manageAction, managePending] = useActionState(
    adminManageSubscription,
    initial,
  );
  const [unassignState, unassignAction, unassignPending] = useActionState(
    adminUnassignStripeObject,
    initial,
  );

  useRefreshOnSuccess(invoiceState);
  useRefreshOnSuccess(subState);
  useRefreshOnSuccess(maintenanceState);
  useRefreshOnSuccess(assignState);
  useRefreshOnSuccess(manageState);
  useRefreshOnSuccess(unassignState);

  const billableCustomers = customers.filter((person) => person.hasBilling);
  const hasCustomers = customers.length > 0;
  const canCreate = billableCustomers.length > 0;
  const standardSubscriptions = subscriptions.filter(
    (sub) => sub.kind !== "maintenance",
  );
  const maintenanceSubscriptions = subscriptions.filter(
    (sub) => sub.kind === "maintenance",
  );

  return (
    <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-2xl italic text-ink">Billing</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Create invoices and subscriptions for this organisation, or assign
        existing Stripe objects. Manage renewals from the list below.
      </p>
      {loadError ? (
        <p className="mt-3 text-sm text-red-600">
          Couldn’t load Stripe billing: {loadError}
        </p>
      ) : null}

      {!hasCustomers ? (
        <p className="mt-4 text-sm text-muted">
          Link a Stripe customer to at least one member before creating invoices
          or subscriptions.
        </p>
      ) : !canCreate ? (
        <p className="mt-4 text-sm text-muted">
          Members with a Stripe customer still need billing details saved on
          their profile before you can create invoices or subscriptions.
        </p>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form action={invoiceAction} className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Create invoice
          </h3>
          <input type="hidden" name="organisationId" value={organisationId} />
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Bill via Stripe customer
            </span>
            <select
              name="customerUserId"
              required
              disabled={!canCreate}
              defaultValue={billableCustomers[0]?.id ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent disabled:opacity-60"
            >
              {billableCustomers.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Description
            </span>
            <input
              name="description"
              required
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Amount
              </span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Currency
              </span>
              <input
                name="currency"
                defaultValue="gbp"
                className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Days until due
            </span>
            <input
              name="daysUntilDue"
              type="number"
              min="1"
              defaultValue={14}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <p className="text-sm text-muted">
            The billed person is emailed a Stripe payment link automatically.
          </p>
          <Feedback state={invoiceState} />
          <button
            type="submit"
            disabled={invoicePending || !canCreate}
            className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {invoicePending ? "Creating…" : "Create invoice"}
          </button>
        </form>

        <form action={subAction} className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Create subscription
          </h3>
          <input type="hidden" name="organisationId" value={organisationId} />
          <input type="hidden" name="kind" value="standard" />
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Bill via Stripe customer
            </span>
            <select
              name="customerUserId"
              required
              disabled={!canCreate}
              defaultValue={billableCustomers[0]?.id ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent disabled:opacity-60"
            >
              {billableCustomers.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Description
            </span>
            <input
              name="description"
              required
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Amount
              </span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Interval
              </span>
              <select
                name="interval"
                defaultValue="month"
                className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Currency
            </span>
            <input
              name="currency"
              defaultValue="gbp"
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <p className="text-sm text-muted">
            The billed person is emailed a Stripe payment link for the first
            invoice.
          </p>
          <Feedback state={subState} />
          <button
            type="submit"
            disabled={subPending || !canCreate}
            className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
          >
            {subPending ? "Creating…" : "Create subscription"}
          </button>
        </form>
      </div>

      <form
        action={maintenanceAction}
        className="mt-8 space-y-3 border-t border-line pt-6"
      >
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Create maintenance subscription
        </h3>
        <p className="text-sm text-muted">
          Separate from standard org subscriptions. The billed person is emailed
          a Stripe payment link for the first invoice.
        </p>
        <input type="hidden" name="organisationId" value={organisationId} />
        <input type="hidden" name="kind" value="maintenance" />
        <input type="hidden" name="description" value="Website maintenance" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Bill via Stripe customer
            </span>
            <select
              name="customerUserId"
              required
              disabled={!canCreate}
              defaultValue={billableCustomers[0]?.id ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent disabled:opacity-60"
            >
              {billableCustomers.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Amount
            </span>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Interval
            </span>
            <select
              name="interval"
              defaultValue="month"
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </label>
        </div>
        <input type="hidden" name="currency" value="gbp" />
        <Feedback state={maintenanceState} />
        <button
          type="submit"
          disabled={maintenancePending || !canCreate}
          className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
        >
          {maintenancePending
            ? "Starting…"
            : "Start maintenance subscription"}
        </button>
      </form>

      <form
        action={assignAction}
        className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
      >
        <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint sm:col-span-2">
          Assign existing Stripe object
        </h3>
        <input type="hidden" name="organisationId" value={organisationId} />
        <input
          name="stripeObjectId"
          required
          placeholder="in_… / sub_… / pi_… / ch_…"
          className="border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent sm:col-span-2"
        />
        <Feedback state={assignState} />
        <button
          type="submit"
          disabled={assignPending}
          className="inline-flex min-h-11 items-center justify-center border border-line px-4 text-sm disabled:opacity-60 sm:col-span-2"
        >
          {assignPending ? "Assigning…" : "Assign to this organisation"}
        </button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-display text-xl italic text-ink">
          Maintenance subscriptions
        </h3>
        <p className="mt-2 text-sm text-muted">
          Ongoing website maintenance plans for this organisation.
        </p>
        <SubscriptionManageList
          subscriptions={maintenanceSubscriptions}
          emptyLabel="No maintenance subscriptions yet."
          manageAction={manageAction}
          managePending={managePending}
          unassignAction={unassignAction}
          unassignPending={unassignPending}
        />
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-display text-xl italic text-ink">
          Other subscriptions
        </h3>
        <p className="mt-2 text-sm text-muted">
          Standard organisation subscriptions (not maintenance).
        </p>
        <SubscriptionManageList
          subscriptions={standardSubscriptions}
          emptyLabel="No other subscriptions linked yet."
          manageAction={manageAction}
          managePending={managePending}
          unassignAction={unassignAction}
          unassignPending={unassignPending}
        />
        <div className="mt-3 space-y-1">
          <Feedback state={manageState} />
          <Feedback state={unassignState} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 border-t border-line pt-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-xl italic text-ink">Invoices</h3>
          {invoices.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No invoices linked to this organisation yet.
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
          <h3 className="font-display text-xl italic text-ink">Payments</h3>
          {payments.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No payments linked to this organisation yet.
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
      </div>
    </section>
  );
}
