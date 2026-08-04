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
    if (session && !session.pending2fa) {
      const active = await requireOrganisationMembership(session);
      if (active) {
        const organisations = await getUserOrganisations(active.userId);
        account = {
          name: active.name,
          organisationName: active.organisationName || "Organisation",
          organisationCount: organisations.length,
        };
      } else {
        // Signed in but still choosing an organisation — show account chrome.
        let organisationCount = 0;
        try {
          organisationCount = (await getUserOrganisations(session.userId)).length;
        } catch {
          organisationCount = 0;
        }
        account = {
          name: session.name || session.email,
          organisationName: "Choose organisation",
          organisationCount,
        };
      }
    }
  } catch {
    account = null;
  }

  return <Header account={account} />;
}
