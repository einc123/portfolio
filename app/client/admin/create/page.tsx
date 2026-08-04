import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCreateUsers } from "@/components/client/AdminCreateUsers";
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

export const metadata: Metadata = {
  title: "Admin · Create",
  robots: { index: false, follow: false },
};

export default async function ClientAdminCreatePage() {
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

  const organisations = await listAllOrganisations();

  return (
    <AdminShell
      title="Create."
      description="Invite or create users, or add a standalone organisation you can assign people to later."
    >
      <AdminCreateUsers
        organisations={organisations.map((org) => ({
          id: org.id,
          name: org.name,
        }))}
      />
    </AdminShell>
  );
}
