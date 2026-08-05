import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { DashboardOverviewSuspended } from "@/components/client/DashboardOverviewSuspended";
import { ViewInvoicesButton } from "@/components/client/ViewInvoicesButton";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findOrganisationById,
  findUserById,
  getOrganisationMembership,
  userHasBillingDetails,
} from "@/lib/auth/users";

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

  const [user, organisation, membership] = await Promise.all([
    findUserById(active.userId),
    findOrganisationById(active.organisationId!),
    getOrganisationMembership(active.userId, active.organisationId!),
  ]);

  if (!user || !userHasBillingDetails(user)) {
    redirect("/client/profile");
  }
  if (!organisation) redirect("/client/select-org");

  const orgName = organisation.name || "Organisation";
  const canSign = Boolean(active.isAdmin || membership?.role === "owner");

  return (
    <>
      <ClientPortalHero
        eyebrow="Dashboard"
        title={`${orgName}.`}
        description="Hosting, maintenance, billing, and contracts for this organisation."
        isAdmin={active.isAdmin}
        actions={<ViewInvoicesButton />}
      />

      <DashboardOverviewSuspended
        organisation={organisation}
        defaultSignerName={user.full_name?.trim() || user.email}
        canSign={canSign}
      />
    </>
  );
}
