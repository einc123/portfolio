import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/client/AdminShell";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import {
  findUserById,
  listAllOrganisations,
  userHasBillingDetails,
} from "@/lib/auth/users";
import {
  parseOrgProjectStatus,
  processSteps,
  type OrgProjectStatus,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin · Status",
  robots: { index: false, follow: false },
};

export default async function ClientAdminStatusPage() {
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

  const organisations = await listAllOrganisations();
  const byStatus = Object.fromEntries(
    processSteps.map((step) => [step.id, [] as typeof organisations]),
  ) as Record<OrgProjectStatus, typeof organisations>;

  for (const org of organisations) {
    byStatus[parseOrgProjectStatus(org.project_status)].push(org);
  }

  return (
    <AdminShell
      title="Status."
      description="Where every organisation is in the process — planning through launch."
    >
      <div className="space-y-8">
        {processSteps.map((step, index) => {
          const orgs = byStatus[step.id];
          return (
            <section
              key={step.id}
              className="border border-line bg-surface px-5 py-6 sm:px-6"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-2xl italic text-ink sm:text-3xl">
                  {step.title}
                </h2>
                <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                  {orgs.length} project{orgs.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {step.description}
              </p>

              {orgs.length === 0 ? (
                <p className="mt-5 text-sm text-faint">No organisations here.</p>
              ) : (
                <ul className="mt-5 divide-y divide-line border border-line">
                  {orgs.map((org) => (
                    <li
                      key={org.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-ink">{org.name}</p>
                      <Link
                        href={`/client/admin/organisations/${org.id}`}
                        className="inline-flex min-h-10 items-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40"
                      >
                        Manage
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
