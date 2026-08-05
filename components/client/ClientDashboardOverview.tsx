import Link from "next/link";
import { CancelMaintenanceButton } from "@/components/client/CancelMaintenanceButton";
import { ClientContractsPanel } from "@/components/client/ClientContractsPanel";
import { OrgStatusTimeline } from "@/components/client/OrgStatusTimeline";
import { RaiseMaintenanceRequestPanel } from "@/components/client/RaiseMaintenanceRequestPanel";
import type { DbOrganisationContract } from "@/lib/contracts/store";
import type { DbOrganisation } from "@/lib/db";
import { resolveHostingUrl } from "@/lib/hosting";
import type {
  PortalInvoice,
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

function unmanagedProviderLabel(
  provider: DbOrganisation["unmanaged_provider"],
) {
  switch (provider) {
    case "spaceship":
      return "Spaceship";
    case "verpex":
      return "Verpex";
    case "other":
      return "other hosting";
    default:
      return "your provider";
  }
}

function isActiveMaintenance(sub: PortalSubscription) {
  return (
    sub.kind === "maintenance" &&
    ["active", "trialing", "past_due"].includes(sub.status)
  );
}

function displayHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ClientDashboardOverview({
  organisation,
  invoices,
  subscriptions,
  billingError,
  hourlyRateLabel,
  contracts,
  defaultSignerName,
  canSign,
  caseStudy,
}: {
  organisation: DbOrganisation;
  invoices: PortalInvoice[];
  subscriptions: PortalSubscription[];
  billingError?: string | null;
  hourlyRateLabel: string;
  contracts: DbOrganisationContract[];
  defaultSignerName: string;
  canSign: boolean;
  caseStudy?: { slug: string; title: string; url?: string | null } | null;
}) {
  const hostingType =
    organisation.hosting_type === "managed" ? "managed" : "unmanaged";
  const unmanagedProvider =
    organisation.unmanaged_provider === "verpex" ||
    organisation.unmanaged_provider === "spaceship" ||
    organisation.unmanaged_provider === "other"
      ? organisation.unmanaged_provider
      : null;
  const hostingUrl =
    organisation.hosting_url?.trim() ||
    resolveHostingUrl({
      hostingType,
      unmanagedProvider,
      otherUrl: organisation.hosting_url,
    });

  const websiteUrl =
    organisation.website_url?.trim() || caseStudy?.url?.trim() || null;
  const caseStudyHref = caseStudy?.slug
    ? `/work/${encodeURIComponent(caseStudy.slug)}`
    : null;

  const activeMaintenance = subscriptions.find(isActiveMaintenance) ?? null;
  const maintenanceIncluded = Boolean(organisation.maintenance_included);
  const hasMaintenanceCoverage = Boolean(activeMaintenance) || maintenanceIncluded;
  const coverageKind = activeMaintenance
    ? "stripe"
    : maintenanceIncluded
      ? "included"
      : "none";
  const periodEndLabel = activeMaintenance?.currentPeriodEnd
    ? formatDate(activeMaintenance.currentPeriodEnd)
    : null;
  const includedAmountLabel =
    organisation.maintenance_included_amount_pence != null &&
    organisation.maintenance_included_amount_pence > 0
      ? money(organisation.maintenance_included_amount_pence, "gbp")
      : null;
  const includedInterval =
    organisation.maintenance_included_interval === "year"
      ? "year"
      : organisation.maintenance_included_interval === "month"
        ? "month"
        : null;

  return (
    <div className="mt-8 space-y-6">
      <OrgStatusTimeline
        status={organisation.project_status}
        variant="compact"
        showViewLink
      />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-line bg-surface px-5 py-6 sm:px-6">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Hosting
          </h2>
          {hostingType === "managed" ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Your hosting is managed internally through{" "}
              <span className="font-medium">{"<! Euan Hosting />"}</span>.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
              <p>
                Your hosting is unmanaged
                {unmanagedProvider
                  ? ` via ${unmanagedProviderLabel(unmanagedProvider)}`
                  : ""}
                .
              </p>
              {hostingUrl ? (
                <p>
                  <a
                    href={hostingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent link-underline"
                  >
                    Open hosting
                  </a>
                </p>
              ) : (
                <p className="text-muted">
                  No hosting link is set for this organisation yet.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="border border-line bg-surface px-5 py-6 sm:px-6">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Maintenance
          </h2>
          {activeMaintenance ? (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-ink">
                You have an active maintenance subscription for this
                organisation.
              </p>
              <p className="mt-2 text-sm text-muted">
                {activeMaintenance.amount != null && activeMaintenance.currency
                  ? `${money(activeMaintenance.amount, activeMaintenance.currency)}${activeMaintenance.interval ? ` / ${activeMaintenance.interval}` : ""}`
                  : activeMaintenance.productName || "Website maintenance"}
                {activeMaintenance.cancelAtPeriodEnd
                  ? periodEndLabel
                    ? ` · Cancels ${periodEndLabel}`
                    : " · Cancels at period end"
                  : periodEndLabel
                    ? ` · Current period ends ${periodEndLabel}`
                    : ""}
              </p>
              {activeMaintenance.cancelAtPeriodEnd ? (
                <p className="mt-3 text-sm text-muted">
                  Cancellation is scheduled for the end of the billing period.
                  Maintenance cannot be paused.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted">
                    You can cancel at the end of the billing period. Maintenance
                    cannot be paused.
                  </p>
                  <CancelMaintenanceButton
                    subscriptionId={activeMaintenance.id}
                    periodEndLabel={periodEndLabel}
                  />
                </>
              )}
            </div>
          ) : maintenanceIncluded ? (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-ink">
                You have a maintenance plan for this organisation.
              </p>
              <p className="mt-2 text-sm text-muted">
                {includedAmountLabel
                  ? `${includedAmountLabel}${includedInterval ? ` / ${includedInterval}` : ""} · `
                  : ""}
                Already included — not billed separately through Stripe.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              You don&apos;t have an active maintenance plan.
            </p>
          )}
        </section>

        {caseStudyHref ? (
          <section className="border border-line bg-surface px-5 py-6 sm:px-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Case study
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {caseStudy?.title
                ? `Your public case study for ${caseStudy.title} is live on the portfolio.`
                : "Your public case study is live on the portfolio."}
            </p>
            <p className="mt-3">
              <a
                href={caseStudyHref}
                target="_blank"
                rel="noreferrer"
                className="text-accent link-underline"
              >
                View case study
              </a>
            </p>
          </section>
        ) : null}

        {websiteUrl ? (
          <section className="border border-line bg-surface px-5 py-6 sm:px-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Live website
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Your live site for this organisation.
            </p>
            <p className="mt-3">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent link-underline"
              >
                {displayHost(websiteUrl)}
              </a>
            </p>
          </section>
        ) : null}
      </div>

      <ClientContractsPanel
        contracts={contracts}
        defaultSignerName={defaultSignerName}
        canSign={canSign}
      />

      <section className="border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">
          Invoices &amp; subscriptions
        </h2>
        <p className="mt-2 text-sm text-muted">
          Billing for this organisation only.
        </p>
        {billingError ? (
          <p className="mt-3 text-sm text-red-600">
            Couldn&apos;t load billing: {billingError}
          </p>
        ) : null}

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Invoices
            </h3>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No invoices for this organisation yet.
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
              Subscriptions
            </h3>
            {subscriptions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No subscriptions for this organisation yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border border-line bg-background">
                {subscriptions.map((sub) => (
                  <li key={sub.id} className="px-4 py-3 text-sm text-ink">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {sub.productName || sub.id}
                        {sub.kind === "maintenance" ? (
                          <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-faint">
                            Maintenance
                          </span>
                        ) : null}
                      </span>
                      <span className="capitalize text-muted">{sub.status}</span>
                    </div>
                    <p className="mt-1 text-muted">
                      {sub.amount != null && sub.currency
                        ? `${money(sub.amount, sub.currency)}${sub.interval ? ` / ${sub.interval}` : ""}`
                        : sub.id}
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
        </div>

        <p className="mt-6 text-sm text-muted">
          To cancel a subscription, get in touch with Euan Livingstone via the{" "}
          <Link href="/contact" className="text-accent link-underline">
            contact page
          </Link>
          .
        </p>
      </section>

      <RaiseMaintenanceRequestPanel
        hasActiveMaintenance={hasMaintenanceCoverage}
        coverageKind={coverageKind}
        hourlyRateLabel={hourlyRateLabel}
        subscriptionId={activeMaintenance?.id ?? null}
      />
    </div>
  );
}
