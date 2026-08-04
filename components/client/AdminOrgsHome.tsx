"use client";

import Link from "next/link";
import { displayInitials } from "@/lib/initials";
import type { AdminOrgRow } from "@/components/client/AdminOrgManageForm";

type OrgListRow = AdminOrgRow & { hasCaseStudy?: boolean };

export function AdminOrgsHome({ organisations }: { organisations: OrgListRow[] }) {
  return (
    <ul className="divide-y divide-line border border-line bg-surface">
      {organisations.map((org) => (
        <li
          key={org.id}
          className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
        >
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-background text-[11px] font-semibold tracking-wide text-ink"
            aria-hidden
          >
            {displayInitials(org.name, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{org.name}</p>
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.12em] text-faint">
              {org.members.length
                ? org.members
                    .map((member) => member.full_name?.trim() || member.email)
                    .join(" · ")
                : "No members"}
              {" · "}
              {org.hasCaseStudy ? "Case study live" : "No case study"}
            </p>
          </div>
          <Link
            href={`/client/admin/organisations/${org.id}`}
            className="inline-flex min-h-10 items-center justify-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40"
          >
            Manage
          </Link>
        </li>
      ))}
    </ul>
  );
}
