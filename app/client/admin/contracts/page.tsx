import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminContractsPanel } from "@/components/client/AdminContractsPanel";
import { AdminShell } from "@/components/client/AdminShell";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  listAllOrganisations,
  userHasBillingDetails,
} from "@/lib/auth/users";
import {
  listAllOrganisationContracts,
  listContractTemplates,
} from "@/lib/contracts/store";

export const metadata: Metadata = {
  title: "Admin · Contracts",
  robots: { index: false, follow: false },
};

export default async function ClientAdminContractsPage() {
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

  const [organisations, templates, contracts] = await Promise.all([
    listAllOrganisations(),
    listContractTemplates(),
    listAllOrganisationContracts(),
  ]);

  return (
    <AdminShell
      title="Contracts."
      description="Write templates, send agreements to organisation owners, and track signatures."
    >
      <AdminContractsPanel
        organisations={organisations.map((org) => ({
          id: org.id,
          name: org.name,
        }))}
        templates={templates}
        contracts={contracts}
      />
    </AdminShell>
  );
}
