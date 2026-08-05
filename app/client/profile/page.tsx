import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddPasskeyButton } from "@/components/client/AddPasskeyButton";
import { BillingDetailsForm } from "@/components/client/BillingDetailsForm";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { ProfileNameForm } from "@/components/client/ProfileNameForm";
import { ProfileStripeSuspended } from "@/components/client/ProfileStripeSuspended";
import { TotpSetupForm } from "@/components/client/TotpSetupForm";
import { ViewInvoicesButton } from "@/components/client/ViewInvoicesButton";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import { findUserById, userHasBillingDetails } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Client profile",
  robots: { index: false, follow: false },
};

export default async function ClientProfilePage() {
  const session = await readSession();
  if (!session) redirect("/client/login");
  if (session.pending2fa) redirect("/client/login");
  if (session.pendingOrgSelect || !session.organisationId) {
    redirect("/client/select-org");
  }

  const active = await requireOrganisationMembership(session);
  if (!active) redirect("/client/select-org");

  const user = await findUserById(active.userId);
  if (!user) redirect("/client/login");

  const billingReady = userHasBillingDetails(user);
  const totpEnabled = Boolean(user.totp_enabled);

  return (
    <>
      <ClientPortalHero
        eyebrow="Profile"
        title={`${active.name}.`}
        description={
          billingReady
            ? "Update your name, billing details, and account security."
            : "Add billing details to unlock your organisation dashboard."
        }
        isAdmin={active.isAdmin}
        navEnabled={billingReady}
        actions={billingReady ? <ViewInvoicesButton /> : null}
      />

      <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">Your name</h2>
        <p className="mt-2 text-sm text-muted">
          Shown in the header and across the client portal.
        </p>
        <ProfileNameForm fullName={user.full_name?.trim() || active.name} />
      </section>

      <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">Billing details</h2>
        <p className="mt-2 text-sm text-muted">
          {billingReady
            ? user.stripe_customer_id
              ? "Saved on your account and synced to your Stripe customer."
              : "Used for invoices and account records. You can update these any time."
            : "Required before you can use the dashboard."}
        </p>
        <BillingDetailsForm
          defaults={{
            billingName:
              user.billing_name?.trim() || user.full_name?.trim() || "",
            line1: user.billing_line1?.trim() || "",
            line2: user.billing_line2?.trim() || "",
            city: user.billing_city?.trim() || "",
            postcode: user.billing_postcode?.trim() || "",
            country: user.billing_country?.trim() || "United Kingdom",
            phone: user.billing_phone?.trim() || "",
          }}
        />
      </section>

      <ProfileStripeSuspended
        customerId={user.stripe_customer_id}
        billingReady={billingReady}
      />

      {billingReady ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl italic text-ink">
            Account security
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Add a passkey for passwordless sign-in, or enable authenticator 2FA
            for password logins.
          </p>
          <AddPasskeyButton />
          <TotpSetupForm enabled={totpEnabled} />
        </section>
      ) : null}
    </>
  );
}
