import { Suspense } from "react";
import { ClientDashboardOverview } from "@/components/client/ClientDashboardOverview";
import type { DbOrganisation } from "@/lib/db";
import { listOrganisationMemberStripeCustomerIds } from "@/lib/auth/users";
import { listContractsForOrganisation } from "@/lib/contracts/store";
import { findCaseStudyByOrganisationId } from "@/lib/caseStudies";
import {
  formatGbpFromPence,
  getHourlyRatePence,
} from "@/lib/settings/store";
import { loadAssignedOrgBilling } from "@/lib/stripe/billing";
import { withTimeout } from "@/lib/withTimeout";

async function DashboardOverviewBody({
  organisation,
  defaultSignerName,
  canSign,
}: {
  organisation: DbOrganisation;
  defaultSignerName: string;
  canSign: boolean;
}) {
  const [customerIds, contracts, hourlyRatePence, caseStudyRecord] =
    await Promise.all([
      listOrganisationMemberStripeCustomerIds(organisation.id),
      listContractsForOrganisation(organisation.id),
      getHourlyRatePence(),
      findCaseStudyByOrganisationId(organisation.id),
    ]);

  let invoices: Awaited<ReturnType<typeof loadAssignedOrgBilling>>["invoices"] =
    [];
  let subscriptions: Awaited<
    ReturnType<typeof loadAssignedOrgBilling>
  >["subscriptions"] = [];
  let billingError: string | null = null;

  try {
    const billing = await withTimeout(
      loadAssignedOrgBilling(organisation.id, customerIds),
      20_000,
    );
    invoices = billing.invoices;
    subscriptions = billing.subscriptions;
  } catch (error) {
    billingError =
      error instanceof Error
        ? /timed out/i.test(error.message)
          ? "Stripe took too long — try refreshing."
          : error.message
        : "Stripe request failed.";
  }

  const caseStudy = caseStudyRecord
    ? {
        slug: caseStudyRecord.project.slug,
        title: caseStudyRecord.project.title,
        url: caseStudyRecord.project.url?.trim() || null,
      }
    : null;

  return (
    <ClientDashboardOverview
      organisation={organisation}
      invoices={invoices}
      subscriptions={subscriptions}
      billingError={billingError}
      hourlyRateLabel={formatGbpFromPence(hourlyRatePence)}
      contracts={contracts}
      defaultSignerName={defaultSignerName}
      canSign={canSign}
      caseStudy={caseStudy}
    />
  );
}

export function DashboardOverviewSuspended({
  organisation,
  defaultSignerName,
  canSign,
}: {
  organisation: DbOrganisation;
  defaultSignerName: string;
  canSign: boolean;
}) {
  return (
    <Suspense
      fallback={
        <p className="mt-8 text-sm text-muted">
          Loading organisation dashboard…
        </p>
      }
    >
      <DashboardOverviewBody
        organisation={organisation}
        defaultSignerName={defaultSignerName}
        canSign={canSign}
      />
    </Suspense>
  );
}
