import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/client/AdminShell";
import { AdminUsersHome } from "@/components/client/AdminUsersHome";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  getUsersWithOrganisationSummary,
  userHasBillingDetails,
} from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Admin · People",
  robots: { index: false, follow: false },
};

export default async function ClientAdminPeoplePage() {
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

  const people = await getUsersWithOrganisationSummary();

  return (
    <AdminShell
      title="People."
      description="Everyone on the client portal. Open a person to manage profile, organisations, billing, or send a password reset."
    >
      <AdminUsersHome
        users={people.map((person) => ({
          id: person.id,
          email: person.email,
          full_name: person.full_name,
          is_admin: person.is_admin,
          status: person.status,
          billing_confirmed: person.billing_confirmed,
          billing_name: person.billing_name,
          billing_line1: person.billing_line1,
          billing_line2: person.billing_line2,
          billing_city: person.billing_city,
          billing_postcode: person.billing_postcode,
          billing_country: person.billing_country,
          billing_phone: person.billing_phone,
          stripe_customer_id: person.stripe_customer_id ?? null,
          organisations: person.organisations,
        }))}
      />
    </AdminShell>
  );
}
