import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminCaseStudyForm } from "@/components/client/AdminCaseStudyForm";
import { AdminOrgBillingPanel } from "@/components/client/AdminOrgBillingPanel";
import { AdminOrgManageForm } from "@/components/client/AdminOrgManageForm";
import { AdminShell } from "@/components/client/AdminShell";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  getOrganisationsWithMemberSummary,
  listAllUsers,
  userHasBillingDetails,
} from "@/lib/auth/users";
import { findCaseStudyByOrganisationId } from "@/lib/caseStudies";
import { loadAssignedOrgBilling } from "@/lib/stripe/billing";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const organisationId = Number(id);
  if (!Number.isFinite(organisationId)) {
    return {
      title: "Manage organisation",
      robots: { index: false, follow: false },
    };
  }
  const orgs = await getOrganisationsWithMemberSummary();
  const org = orgs.find((row) => row.id === organisationId);
  return {
    title: `Admin · ${org?.name ?? "Organisation"}`,
    robots: { index: false, follow: false },
  };
}

export default async function ClientAdminManageOrganisationPage({
  params,
}: Props) {
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
  const organisationId = Number(id);
  if (!Number.isFinite(organisationId)) notFound();

  const [organisations, users, caseStudy] = await Promise.all([
    getOrganisationsWithMemberSummary(),
    listAllUsers(),
    findCaseStudyByOrganisationId(organisationId),
  ]);
  const organisation = organisations.find((row) => row.id === organisationId);
  if (!organisation) notFound();

  const memberIds = new Set(organisation.members.map((member) => member.id));
  const stripeCustomers = users
    .filter(
      (person) =>
        memberIds.has(person.id) && Boolean(person.stripe_customer_id),
    )
    .map((person) => ({
      id: person.id,
      label: `${person.full_name?.trim() || person.email} (${person.stripe_customer_id})`,
      stripeCustomerId: person.stripe_customer_id as string,
      hasBilling: userHasBillingDetails(person),
    }));

  let orgBilling: Awaited<ReturnType<typeof loadAssignedOrgBilling>> = {
    invoices: [],
    payments: [],
    subscriptions: [],
    assignments: [],
  };
  let billingLoadError: string | null = null;
  try {
    orgBilling = await loadAssignedOrgBilling(
      organisationId,
      stripeCustomers.map((person) => person.stripeCustomerId),
    );
  } catch (error) {
    billingLoadError =
      error instanceof Error ? error.message : "Stripe request failed.";
  }

  return (
    <AdminShell
      title={`${organisation.name}.`}
      description="Update details, billing, people, and portfolio case study."
    >
      <p className="mb-6 text-sm text-muted">
        <Link
          href="/client/admin/organisations"
          className="link-underline text-accent"
        >
          ← Back to organisations
        </Link>
      </p>
      <AdminOrgManageForm
        organisation={{
          id: organisation.id,
          name: organisation.name,
          description: organisation.description,
          hosting_type:
            organisation.hosting_type === "managed" ? "managed" : "unmanaged",
          unmanaged_provider:
            organisation.unmanaged_provider === "verpex" ||
            organisation.unmanaged_provider === "spaceship" ||
            organisation.unmanaged_provider === "other"
              ? organisation.unmanaged_provider
              : null,
          hosting_url: organisation.hosting_url ?? null,
          members: organisation.members,
        }}
        users={users.map((person) => ({
          id: person.id,
          email: person.email,
          full_name: person.full_name,
        }))}
      />
      <AdminOrgBillingPanel
        organisationId={organisation.id}
        customers={stripeCustomers}
        invoices={orgBilling.invoices}
        payments={orgBilling.payments}
        subscriptions={orgBilling.subscriptions}
        loadError={billingLoadError}
      />
      <AdminCaseStudyForm
        organisationId={organisation.id}
        organisationName={organisation.name}
        organisationSlug={organisation.slug}
        caseStudy={
          caseStudy
            ? {
                ...caseStudy.project,
                seoTitle: caseStudy.row.seo_title,
                seoDescription: caseStudy.row.seo_description,
                seoHeadline: caseStudy.row.seo_headline,
                showOnLocal: Boolean(caseStudy.row.show_on_local),
                showOnCharity: Boolean(caseStudy.row.show_on_charity),
              }
            : null
        }
      />
    </AdminShell>
  );
}
