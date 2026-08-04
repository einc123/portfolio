import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { OrgSelectForm } from "@/components/client/OrgSelectForm";
import { OrgSettingsModal } from "@/components/client/OrgSettingsModal";
import { readSession } from "@/lib/auth/session";
import { findUserById, getUserOrganisations, userHasBillingDetails } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Organisations",
  robots: { index: false, follow: false },
};

export default async function SelectOrgPage() {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");

  const organisations = await getUserOrganisations(session.userId);
  if (organisations.length === 0) {
    redirect("/client/login");
  }

  const picking = Boolean(session.pendingOrgSelect || !session.organisationId);
  const user = session.organisationId
    ? await findUserById(session.userId)
    : null;
  const billingReady = user ? userHasBillingDetails(user) : false;
  const orgItems = organisations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description,
    role: org.role,
  }));

  return (
    <>
      <ClientPortalHero
        eyebrow="Organisations"
        title="Which organisation?"
        description={
          picking
            ? "Choose an organisation to continue into the client portal."
            : "Switch organisation anytime. Each one opens its own dashboard."
        }
        isAdmin={session.isAdmin}
        navEnabled={!picking && billingReady}
        actions={
          !picking ? (
            <OrgSettingsModal
              organisations={orgItems}
              isAdmin={session.isAdmin}
            />
          ) : null
        }
      />
      <div className="mt-8">
        <OrgSelectForm
          currentOrganisationId={
            picking ? undefined : session.organisationId || undefined
          }
          organisations={orgItems}
        />
      </div>
    </>
  );
}
