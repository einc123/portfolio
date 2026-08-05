import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { OrgStatusTimeline } from "@/components/client/OrgStatusTimeline";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findOrganisationById,
  findUserById,
  userHasBillingDetails,
} from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Organisation status",
  robots: { index: false, follow: false },
};

export default async function ClientStatusPage() {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");
  if (session.pendingOrgSelect || !session.organisationId) {
    redirect("/client/select-org");
  }

  const active = await requireOrganisationMembership(session);
  if (!active) redirect("/client/select-org");

  const [user, organisation] = await Promise.all([
    findUserById(active.userId),
    findOrganisationById(active.organisationId!),
  ]);

  if (!user || !userHasBillingDetails(user)) {
    redirect("/client/profile");
  }
  if (!organisation) redirect("/client/select-org");

  const orgName = organisation.name || "Organisation";

  return (
    <>
      <ClientPortalHero
        eyebrow="Status"
        title={`${orgName}.`}
        description="Where this project sits in the process — from planning through to launch."
        isAdmin={active.isAdmin}
      />

      <div className="mt-8">
        <OrgStatusTimeline status={organisation.project_status} variant="full" />
      </div>
    </>
  );
}
