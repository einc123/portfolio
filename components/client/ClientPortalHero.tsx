"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/client/actions";

export type PortalNavId =
  | "dashboard"
  | "status"
  | "profile"
  | "security"
  | "organisations"
  | "admin";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  isAdmin?: boolean;
  /** Hide portal links while picking an organisation mid-login */
  navEnabled?: boolean;
  actions?: React.ReactNode;
};

const NAV: { id: PortalNavId; href: string; label: string; adminOnly?: boolean }[] =
  [
    { id: "dashboard", href: "/client/dashboard", label: "Dashboard" },
    { id: "status", href: "/client/status", label: "Status" },
    { id: "profile", href: "/client/profile", label: "Profile" },
    { id: "security", href: "/client/security", label: "Security" },
    {
      id: "organisations",
      href: "/client/select-org",
      label: "Organisations",
    },
    { id: "admin", href: "/client/admin", label: "Admin", adminOnly: true },
  ];

function activeId(pathname: string): PortalNavId | null {
  if (pathname.startsWith("/client/admin")) return "admin";
  if (pathname.startsWith("/client/security")) return "security";
  if (pathname.startsWith("/client/profile")) return "profile";
  if (pathname.startsWith("/client/status")) return "status";
  if (pathname.startsWith("/client/invoices")) return "dashboard";
  if (pathname.startsWith("/client/select-org")) return "organisations";
  if (pathname.startsWith("/client/dashboard")) return "dashboard";
  return null;
}

export function ClientPortalHero({
  eyebrow = "Client portal",
  title,
  description,
  isAdmin = false,
  navEnabled = true,
  actions,
}: Props) {
  const pathname = usePathname();
  const current = activeId(pathname);

  const links = NAV.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <section className="relative overflow-hidden border border-line bg-surface">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-glow/35 blur-3xl sm:h-72 sm:w-72"
        style={{ animation: "float-soft 10s ease-in-out infinite" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-accent-soft/70 blur-3xl"
        style={{ animation: "brand-pulse 8s ease-in-out infinite" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 42%, color-mix(in srgb, var(--glow, var(--accent)) 10%, transparent))",
        }}
        aria-hidden
      />

      <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className="font-brand text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,9vw,4.25rem)] italic leading-[0.95] text-ink">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center border border-line bg-background/80 px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent/40"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {navEnabled ? (
          <nav
            className="client-hero-nav mt-8 border-t border-line/80 pt-5"
            aria-label="Client portal"
          >
            {links.map((item) => {
              const active = current === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`client-hero-nav__link border${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
