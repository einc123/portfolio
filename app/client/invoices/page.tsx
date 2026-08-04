import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findOrganisationById,
  findUserById,
  listOrganisationMemberStripeCustomerIds,
  userHasBillingDetails,
} from "@/lib/auth/users";
import {
  loadAssignedOrgBilling,
  type PortalInvoice,
} from "@/lib/stripe/billing";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false, follow: false },
};

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

export default async function ClientInvoicesPage() {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");
  if (session.pendingOrgSelect || !session.organisationId) {
    redirect("/client/select-org");
  }

  const active = await requireOrganisationMembership(session);
  if (!active) redirect("/client/select-org");

  const user = await findUserById(active.userId);
  if (!user || !userHasBillingDetails(user)) {
    redirect("/client/profile");
  }

  const organisation = await findOrganisationById(active.organisationId!);
  if (!organisation) redirect("/client/select-org");

  let invoices: PortalInvoice[] = [];
  let billingError: string | null = null;

  try {
    const customerIds = await listOrganisationMemberStripeCustomerIds(
      organisation.id,
    );
    const billing = await loadAssignedOrgBilling(organisation.id, customerIds);
    invoices = billing.invoices;
  } catch (error) {
    billingError =
      error instanceof Error ? error.message : "Stripe request failed.";
  }

  return (
    <>
      <ClientPortalHero
        eyebrow="Invoices"
        title={`${organisation.name}.`}
        description="Invoices for this organisation, including subscription billing."
        isAdmin={active.isAdmin}
      />

      <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl italic text-ink">
              Organisation invoices
            </h2>
            <p className="mt-2 text-sm text-muted">
              Standalone invoices and invoices tied to subscriptions for{" "}
              {organisation.name}.
            </p>
          </div>
          <Link
            href="/client/dashboard"
            className="text-sm text-accent link-underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        {billingError ? (
          <p className="mt-4 text-sm text-red-600">
            Couldn&apos;t load invoices: {billingError}
          </p>
        ) : null}

        {invoices.length === 0 && !billingError ? (
          <p className="mt-6 text-sm text-muted">
            No invoices for this organisation yet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line border border-line bg-background">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="px-4 py-4 text-sm text-ink">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {invoice.number || invoice.id}
                  </span>
                  <span className="capitalize text-muted">
                    {invoice.status || "unknown"}
                  </span>
                </div>
                <p className="mt-1 text-muted">
                  {money(invoice.amountDue, invoice.currency)}
                  {invoice.amountPaid > 0 &&
                  invoice.amountPaid !== invoice.amountDue
                    ? ` · Paid ${money(invoice.amountPaid, invoice.currency)}`
                    : ""}{" "}
                  · {formatDate(invoice.created)}
                  {invoice.description ? ` · ${invoice.description}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {invoice.hostedInvoiceUrl ? (
                    <a
                      href={invoice.hostedInvoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent link-underline"
                    >
                      Open invoice
                    </a>
                  ) : null}
                  {invoice.invoicePdf ? (
                    <a
                      href={invoice.invoicePdf}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent link-underline"
                    >
                      Download PDF
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
