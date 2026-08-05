"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; exact?: boolean }[] = [
  { href: "/client/admin", label: "People", exact: true },
  { href: "/client/admin/organisations", label: "Organisations" },
  { href: "/client/admin/status", label: "Status" },
  { href: "/client/admin/contracts", label: "Contracts" },
  { href: "/client/admin/settings", label: "Settings" },
  { href: "/client/admin/create", label: "Create" },
];

export function AdminSubnav() {
  const pathname = usePathname();

  return (
    <nav
      className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4"
      aria-label="Admin sections"
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-10 items-center px-4 text-[12px] uppercase tracking-[0.14em] transition-colors ${
              active
                ? "bg-accent text-on-accent dark:bg-[color-mix(in_srgb,var(--accent)_88%,white)] dark:text-[#0a0e0c]"
                : "border border-line bg-surface text-ink hover:border-accent/40"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
