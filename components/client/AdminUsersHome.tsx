"use client";

import Link from "next/link";
import { displayInitials } from "@/lib/initials";
import type { AdminUserRow } from "@/components/client/AdminUserManageForm";

export function AdminUsersHome({ users }: { users: AdminUserRow[] }) {
  return (
    <ul className="divide-y divide-line border border-line bg-surface">
      {users.map((user) => {
        const label = user.full_name?.trim() || user.email;
        return (
          <li
            key={user.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
          >
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-background text-[11px] font-semibold tracking-wide text-ink"
              aria-hidden
            >
              {displayInitials(label)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{label}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.12em] text-faint">
                {user.organisations.length
                  ? user.organisations.map((org) => org.name).join(" · ")
                  : "No organisations"}
                {user.is_admin ? " · Admin" : ""}
                {" · "}
                {user.status}
              </p>
            </div>
            <Link
              href={`/client/admin/people/${user.id}`}
              className="inline-flex min-h-10 items-center justify-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40"
            >
              Manage
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
