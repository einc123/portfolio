import { Header, type HeaderAccount } from "@/components/Header";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import { getUserOrganisations } from "@/lib/auth/users";

export async function SiteHeader() {
  let account: HeaderAccount | null = null;

  try {
    const session = await readSession();
    const active = await requireOrganisationMembership(session);
    if (active) {
      const organisations = await getUserOrganisations(active.userId);
      account = {
        name: active.name,
        organisationName: active.organisationName || "Organisation",
        organisationCount: organisations.length,
      };
    }
  } catch {
    account = null;
  }

  return <Header account={account} />;
}
