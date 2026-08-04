import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/client/ClientLoginForm";
import { readSession, requireOrganisationMembership } from "@/lib/auth/session";
import { findUserById, userHasBillingDetails } from "@/lib/auth/users";

export const metadata: Metadata = {
  title: "Client login",
  robots: { index: false, follow: false },
};

export default async function ClientLoginPage() {
  const session = await readSession();
  // Only treat as signed-in when membership is still valid (read-only check).
  const active = await requireOrganisationMembership(session);
  if (active) {
    const user = await findUserById(active.userId);
    redirect(
      user && userHasBillingDetails(user)
        ? "/client/dashboard"
        : "/client/profile",
    );
  }
  if (session?.pending2fa) {
    // Form handles 2FA mode via server state; keep them on login.
  } else if (session?.pendingOrgSelect || (session && !session.organisationId)) {
    redirect("/client/select-org");
  }

  return (
    <>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,10vw,4.5rem)] italic leading-[0.95] text-ink">
        Client login.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Sign in with email and password, email and password plus 2FA, or a
        passkey. Accounts are invite-only — there&apos;s no public registration.
      </p>
      <ClientLoginForm
        initialMode={session?.pending2fa ? "2fa" : "password"}
      />
    </>
  );
}
