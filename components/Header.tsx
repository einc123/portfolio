"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { DiscordPresence } from "@/components/DiscordPresence";
import { ThemeToggle } from "@/components/ThemeToggle";
import { nav, site } from "@/lib/data";

export type HeaderAccount = {
  name: string;
  organisationName: string;
  organisationCount: number;
};

function formatMenuClock(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${day} · ${time}`;
}

function MenuLocation() {
  const [clock, setClock] = useState("");

  useEffect(() => {
    function tick() {
      setClock(formatMenuClock(new Date()));
    }

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/45">
      <span className="inline-flex items-center gap-1.5">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3.5 w-3.5 shrink-0 text-accent-soft"
          aria-hidden
        >
          <path
            d="M8 1.75c-2.4 0-4.35 1.9-4.35 4.25 0 3.2 4.35 8.25 4.35 8.25s4.35-5.05 4.35-8.25C12.35 3.65 10.4 1.75 8 1.75Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <circle
            cx="8"
            cy="6"
            r="1.35"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
        <span>{site.location}</span>
      </span>
      {clock ? (
        <>
          <span className="text-white/25" aria-hidden>
            /
          </span>
          <time className="tabular-nums text-white/45">{clock}</time>
        </>
      ) : null}
    </p>
  );
}

export function Header({ account = null }: { account?: HeaderAccount | null }) {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled((wasScrolled) => {
          // Hysteresis stops compact/expand padding from fighting scrollY.
          if (!wasScrolled && y > 48) return true;
          if (wasScrolled && y < 8) return false;
          return wasScrolled;
        });
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const frosted = scrolled && !open;

  const orgDashboardHref =
    account?.organisationName === "Choose organisation"
      ? "/client/select-org"
      : "/client/dashboard";

  const accountChipClass = (isOpen: boolean) =>
    `box-border inline-flex h-9 items-center border px-2.5 text-[11px] font-medium leading-none tracking-wide transition-colors sm:px-3 sm:text-[12px] ${
      isOpen
        ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
        : "border-line bg-surface text-ink hover:border-accent"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
        frosted
          ? "border-b border-line bg-background/65 shadow-[0_1px_0_rgba(18,22,20,0.04)] backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="page-pad mx-auto flex w-full max-w-6xl items-center justify-between gap-2 py-3.5 sm:gap-3 sm:py-4 md:py-5">
        <div className="relative z-[60] flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`min-w-0 truncate font-brand text-[13px] font-semibold tracking-tight transition-colors duration-300 hover:opacity-70 sm:text-[15px] md:text-base ${
              open ? "text-white" : "text-ink"
            }`}
          >
            {site.brand}
          </Link>
          <span className="hidden min-[480px]:inline-flex">
            <DiscordPresence inverted={open} />
          </span>
        </div>

        <div className="relative z-[60] flex shrink-0 items-center gap-3 sm:gap-3 md:gap-6">
          {account ? (
            <>
              <Link
                href={orgDashboardHref}
                className={`group inline-flex min-h-11 min-w-11 items-center justify-center transition-opacity duration-300 md:hidden ${
                  open ? "text-white" : "text-ink"
                }`}
                aria-label="Organisation dashboard"
                title={account.organisationName}
                onClick={() => setOpen(false)}
              >
                <span className="relative h-5 w-5 shrink-0" aria-hidden>
                  <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5">
                    <circle
                      cx="8"
                      cy="5.5"
                      r="2.25"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    />
                    <path
                      d="M3.5 13.25c.7-2.1 2.3-3.25 4.5-3.25s3.8 1.15 4.5 3.25"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </Link>
              <div className="hidden items-center gap-1.5 md:flex md:gap-2">
                <Link
                  href="/client/profile"
                  onClick={() => setOpen(false)}
                  className={`${accountChipClass(open)} max-w-[12rem] truncate`}
                  title={account.name}
                >
                  <span className="truncate">{account.name}</span>
                </Link>
                <div
                  className={`box-border inline-flex h-9 min-w-0 items-center gap-1.5 border px-2.5 sm:px-3 ${
                    open
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-line bg-surface text-ink"
                  }`}
                >
                  <Link
                    href={orgDashboardHref}
                    onClick={() => setOpen(false)}
                    className="min-w-0 max-w-[11rem] truncate text-[11px] font-medium leading-none tracking-wide transition-opacity hover:opacity-70 sm:text-[12px]"
                    title={account.organisationName}
                  >
                    {account.organisationName}
                  </Link>
                  <Link
                    href="/client/select-org"
                    onClick={() => setOpen(false)}
                    className={`inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-70 ${
                      open ? "text-white" : "text-ink"
                    }`}
                    aria-label="Switch organisation"
                    title="Switch organisation"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
                      <path
                        d="M4.5 5.5 8 2.5l3.5 3M11.5 10.5 8 13.5l-3.5-3"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <Link
              href="/client/login"
              className={`group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 text-[12px] uppercase tracking-[0.14em] transition-opacity duration-300 sm:min-w-0 sm:justify-start sm:text-[13px] ${
                open ? "text-white" : "text-ink"
              }`}
              aria-label="Client login"
              title="Client login"
              onClick={() => setOpen(false)}
            >
              <span className="hidden transition-opacity group-hover:opacity-70 sm:inline">
                Client login
              </span>
              <span className="relative h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden>
                <svg viewBox="0 0 16 16" fill="none" className="h-5 w-5 sm:h-4 sm:w-4">
                  <circle
                    cx="8"
                    cy="5.5"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M3.5 13.25c.7-2.1 2.3-3.25 4.5-3.25s3.8 1.15 4.5 3.25"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </Link>
          )}
          <ThemeToggle inverted={open} />
          <button
            type="button"
            className={`group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 text-[12px] uppercase tracking-[0.14em] transition-colors duration-300 sm:min-w-0 sm:justify-start sm:gap-3 sm:text-[13px] ${
              open ? "text-white" : "text-ink"
            }`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="hidden transition-opacity group-hover:opacity-70 min-[380px]:inline">
              {open ? "Close" : "Menu"}
            </span>
            <span className="relative h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 sm:h-4 sm:w-4 ${
                  open ? "scale-75 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                <path
                  d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 sm:h-4 sm:w-4 ${
                  open ? "scale-100 opacity-100" : "scale-75 opacity-0"
                }`}
              >
                <path
                  d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={`menu-overlay fixed inset-0 z-50 ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="menu-overlay__panel absolute inset-0 bg-[#0a0e0c]">
          <div
            className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-glow/20 blur-3xl"
            aria-hidden
          />
        </div>

        <div className="menu-overlay__scroll relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(4.25rem+env(safe-area-inset-top))] sm:px-6 md:px-10 md:pb-8 md:pt-[calc(5.75rem+env(safe-area-inset-top))]">
          <div className="menu-overlay__meta shrink-0 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
              Navigation
            </p>

            {account ? (
              <div className="flex flex-col gap-2 border border-white/10 bg-white/[0.04] p-3 md:hidden">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Account
                </p>
                <Link
                  href="/client/profile"
                  onClick={() => setOpen(false)}
                  className="truncate text-sm text-white/90 transition-colors hover:text-white"
                  tabIndex={open ? 0 : -1}
                >
                  {account.name}
                </Link>
                <div className="flex min-w-0 items-center gap-2">
                  <Link
                    href={orgDashboardHref}
                    onClick={() => setOpen(false)}
                    className="min-w-0 flex-1 truncate text-sm text-white/70 transition-colors hover:text-white"
                    tabIndex={open ? 0 : -1}
                  >
                    {account.organisationName}
                  </Link>
                  <Link
                    href="/client/select-org"
                    onClick={() => setOpen(false)}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-white/15 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
                    tabIndex={open ? 0 : -1}
                  >
                    Switch
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
                      <path
                        d="M4.5 5.5 8 2.5l3.5 3M11.5 10.5 8 13.5l-3.5-3"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <nav
            className="menu-overlay__nav mt-auto flex flex-col gap-1 pb-8 sm:gap-2 sm:pb-10 md:gap-3 md:pb-14"
            aria-label="Primary"
          >
            {nav.map((item, index) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="menu-overlay__link group flex min-h-12 min-w-0 items-baseline gap-3 sm:gap-4 md:gap-6"
                  style={{ ["--i" as string]: index }}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="w-7 shrink-0 text-[11px] uppercase tracking-[0.16em] text-white/35 transition-colors group-hover:text-[var(--menu-active)] sm:w-8">
                    0{index + 1}
                  </span>
                  <span
                    className={`min-w-0 break-words font-display text-[clamp(2.1rem,10vw,6.5rem)] leading-[0.95] italic transition-colors ${
                      active
                        ? "text-[var(--menu-active)]"
                        : "text-white group-hover:text-[var(--menu-active)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="menu-overlay__footer flex shrink-0 flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6">
            <MenuLocation />
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a
                href={`mailto:${site.email}`}
                className="break-anywhere text-white/70 transition-colors hover:text-white"
                tabIndex={open ? 0 : -1}
              >
                {site.email}
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                tabIndex={open ? 0 : -1}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
