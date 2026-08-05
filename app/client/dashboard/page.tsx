import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientDashboardOverview } from "@/components/client/ClientDashboardOverview";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { ViewInvoicesButton } from "@/components/client/ViewInvoicesButton";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findOrganisationById,
  findUserById,
  getOrganisationMembership,
  listOrganisationMemberStripeCustomerIds,
  userHasBillingDetails,
} from "@/lib/auth/users";
import { listContractsForOrganisation } from "@/lib/contracts/store";
import { findCaseStudyByOrganisationId } from "@/lib/caseStudies";
import {
  formatGbpFromPence,
  getHourlyRatePence,
} from "@/lib/settings/store";
import { loadAssignedOrgBilling } from "@/lib/stripe/billing";
import { withTimeout } from "@/lib/withTimeout";

export const metadata: Metadata = {
  title: "Client dashboard",
  robots: { index: false, follow: false },
};

export default async function ClientDashboardPage() {
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

  const orgName = organisation.name || "Organisation";
  const membership = await getOrganisationMembership(
    active.userId,
    organisation.id,
  );
  const canSign = Boolean(active.isAdmin || membership?.role === "owner");

  let invoices: Awaited<ReturnType<typeof loadAssignedOrgBilling>>["invoices"] =
    [];
  let subscriptions: Awaited<
    ReturnType<typeof loadAssignedOrgBilling>
  >["subscriptions"] = [];
  let billingError: string | null = null;

  try {
    const customerIds = await listOrganisationMemberStripeCustomerIds(
      organisation.id,
    );
    const billing = await withTimeout(
      loadAssignedOrgBilling(organisation.id, customerIds),
      10_000,
    );
    invoices = billing.invoices;
    subscriptions = billing.subscriptions;
  } catch (error) {
    billingError =
      error instanceof Error ? error.message : "Stripe request failed.";
  }

  const contracts = await listContractsForOrganisation(organisation.id);
  const hourlyRateLabel = formatGbpFromPence(await getHourlyRatePence());
  const caseStudyRecord = await findCaseStudyByOrganisationId(organisation.id);
  const caseStudy = caseStudyRecord
    ? {
        slug: caseStudyRecord.project.slug,
        title: caseStudyRecord.project.title,
        url: caseStudyRecord.project.url?.trim() || null,
      }
    : null;

  return (
    <>
      <ClientPortalHero
        eyebrow="Dashboard"
        title={`${orgName}.`}
        description="Hosting, maintenance, billing, and contracts for this organisation."
        isAdmin={active.isAdmin}
        actions={<ViewInvoicesButton />}
      />

      <ClientDashboardOverview
        organisation={organisation}
        invoices={invoices}
        subscriptions={subscriptions}
        billingError={billingError}
        hourlyRateLabel={hourlyRateLabel}
        contracts={contracts}
        defaultSignerName={user.full_name?.trim() || user.email}
        canSign={canSign}
        caseStudy={caseStudy}
      />
    </>
  );
}
