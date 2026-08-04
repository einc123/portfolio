import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminOrgsHome } from "@/components/client/AdminOrgsHome";
import { AdminShell } from "@/components/client/AdminShell";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  getOrganisationsWithMemberSummary,
  userHasBillingDetails,
} from "@/lib/auth/users";
import { queryRows } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin · Organisations",
  robots: { index: false, follow: false },
};

export default async function ClientAdminOrganisationsPage() {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");
  if (session.pendingOrgSelect || !session.organisationId) {
    redirect("/client/select-org");
  }

  const active = await requireOrganisationMembership(session);
  if (!active) redirect("/client/select-org");
  if (!active.isAdmin) redirect("/client/dashboard");

  const user = await findUserById(active.userId);
  if (!user || !userHasBillingDetails(user)) redirect("/client/profile");

  const [organisations, caseStudyRows] = await Promise.all([
    getOrganisationsWithMemberSummary(),
    queryRows<{ organisation_id: number }>(
      `SELECT organisation_id FROM organisation_case_studies`,
    ),
  ]);
  const withCaseStudy = new Set(
    caseStudyRows.map((row) => row.organisation_id),
  );

  return (
    <AdminShell
      title="Organisations."
      description="Every organisation on the portal. Open one to edit details, assign members, or publish a case study."
    >
      <AdminOrgsHome
        organisations={organisations.map((org) => ({
          id: org.id,
          name: org.name,
          description: org.description,
          hosting_type:
            org.hosting_type === "managed" ? "managed" : "unmanaged",
          unmanaged_provider:
            org.unmanaged_provider === "verpex" ||
            org.unmanaged_provider === "spaceship" ||
            org.unmanaged_provider === "other"
              ? org.unmanaged_provider
              : null,
          hosting_url: org.hosting_url ?? null,
          website_url: org.website_url ?? null,
          members: org.members,
          hasCaseStudy: withCaseStudy.has(org.id),
        }))}
      />
    </AdminShell>
  );
}
