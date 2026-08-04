import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddPasskeyButton } from "@/components/client/AddPasskeyButton";
import { ClientPortalHero } from "@/components/client/ClientPortalHero";
import { TotpSetupForm } from "@/components/client/TotpSetupForm";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import { findUserById, userHasBillingDetails } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Account security",
  robots: { index: false, follow: false },
};

export default async function ClientSecurityPage() {
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
  if (!userHasBillingDetails(user)) redirect("/client/profile");

  const totpEnabled = Boolean(user.totp_enabled);

  return (
    <>
      <ClientPortalHero
        eyebrow="Security"
        title="Account security."
        description="Add a passkey for passwordless sign-in, or enable authenticator 2FA for password logins."
        isAdmin={active.isAdmin}
      />

      <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">Passkeys</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Sign in with Face ID, Touch ID, Windows Hello, or a hardware key.
        </p>
        <AddPasskeyButton />
      </section>

      <section className="mt-8 border border-line bg-surface px-5 py-6 sm:px-6">
        <h2 className="font-display text-2xl italic text-ink">
          Authenticator app
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Extra protection when signing in with your password.
        </p>
        <TotpSetupForm enabled={totpEnabled} />
      </section>
    </>
  );
}
