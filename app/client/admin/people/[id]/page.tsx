import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/client/AdminShell";
import { AdminUserManageForm } from "@/components/client/AdminUserManageForm";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  getUsersWithOrganisationSummary,
  listAllOrganisations,
  userHasBillingDetails,
} from "@/lib/auth/users";
import { listCustomerBilling } from "@/lib/stripe/billing";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return { title: "Manage person", robots: { index: false, follow: false } };
  }
  const user = await findUserById(userId);
  const label = user?.full_name?.trim() || user?.email || "Person";
  return {
    title: `Admin · ${label}`,
    robots: { index: false, follow: false },
  };
}

export default async function ClientAdminManagePersonPage({ params }: Props) {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");
  if (session.pendingOrgSelect || !session.organisationId) {
    redirect("/client/select-org");
  }

  const active = await requireOrganisationMembership(session);
  if (!active) redirect("/client/select-org");
  if (!active.isAdmin) redirect("/client/dashboard");

  const adminUser = await findUserById(active.userId);
  if (!adminUser || !userHasBillingDetails(adminUser)) {
    redirect("/client/profile");
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) notFound();

  const [people, allOrgs] = await Promise.all([
    getUsersWithOrganisationSummary(),
    listAllOrganisations(),
  ]);
  const person = people.find((row) => row.id === userId);
  if (!person) notFound();

  const label = person.full_name?.trim() || person.email;
  let stripeBilling: Awaited<ReturnType<typeof listCustomerBilling>> | null =
    null;
  if (person.stripe_customer_id) {
    try {
      stripeBilling = await listCustomerBilling(person.stripe_customer_id);
    } catch {
      stripeBilling = null;
    }
  }

  return (
    <AdminShell
      title={`${label}.`}
      description="Update profile, organisations, billing, Stripe, or send a password reset."
    >
      <p className="mb-6 text-sm text-muted">
        <Link href="/client/admin" className="link-underline text-accent">
          ← Back to people
        </Link>
      </p>
      <AdminUserManageForm
        user={{
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
        }}
        organisations={allOrgs.map((org) => ({ id: org.id, name: org.name }))}
        stripeBilling={stripeBilling}
      />
    </AdminShell>
  );
}
