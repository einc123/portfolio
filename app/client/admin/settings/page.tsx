import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSettingsPanel } from "@/components/client/AdminSettingsPanel";
import { AdminShell } from "@/components/client/AdminShell";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import { findUserById, userHasBillingDetails } from "@/lib/auth/users";
import { getHourlyRatePence } from "@/lib/settings/store";

export const metadata: Metadata = {
  title: "Admin · Settings",
  robots: { index: false, follow: false },
};

export default async function ClientAdminSettingsPage() {
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

  const pence = await getHourlyRatePence();
  const hourlyRatePounds = (pence / 100).toFixed(2);

  return (
    <AdminShell
      title="Settings."
      description="Presets shown across the client portal, including maintenance hourly rates."
    >
      <AdminSettingsPanel hourlyRatePounds={hourlyRatePounds} />
    </AdminShell>
  );
}
