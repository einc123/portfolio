import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Page not found",
  description: `That page doesn’t exist on ${site.name}'s portfolio. Head home, browse work, or get in touch.`,
  robots: {
    index: false,
    follow: true,
  },
};

const links = [
  {
    href: "/",
    label: "Home",
    note: "Portfolio overview",
  },
  {
    href: "/work",
    label: "Work",
    note: "Case studies",
  },
  {
    href: "/charity",
    label: "Charity",
    note: "Community & pro bono",
  },
  {
    href: "/dunfermline",
    label: "Dunfermline",
    note: "Local design & development",
  },
  {
    href: "/hosting",
    label: "Hosting",
    note: "Managed OVH, Spaceship or Verpex",
  },
  {
    href: "/photography",
    label: "Photography",
    note: "Stills & licensed drone",
  },
  {
    href: "/book",
    label: "Book a chat",
    note: "Pick a time",
  },
  {
    href: "/contact",
    label: "Contact",
    note: "Send a note",
  },
] as const;

export default function NotFound() {
  return (
    <div className="page-pad relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl flex-col justify-center pb-16 pt-10 sm:min-h-[calc(100vh-5.5rem)]">
      <div
        className="pointer-events-none absolute -right-6 top-16 h-44 w-44 rounded-full bg-glow/35 blur-3xl sm:h-64 sm:w-64"
        style={{ animation: "float-soft 9s ease-in-out infinite" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-28 left-0 h-36 w-36 rounded-full bg-accent-soft/50 blur-3xl"
        style={{ animation: "brand-pulse 7s ease-in-out infinite" }}
        aria-hidden
      />

      <p className="font-brand text-[10px] font-semibold uppercase tracking-[0.14em] text-accent sm:text-[11px]">
        {site.brand}
      </p>

      <p
        className="mt-6 font-display text-[clamp(5.5rem,28vw,14rem)] italic leading-none text-ink/10"
        aria-hidden
      >
        404
      </p>

      <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.5rem,10vw,4.75rem)] italic leading-[0.95] text-ink sm:-mt-10 md:-mt-14">
        This page wandered off.
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
        The link may be outdated, or the route never existed. Try one of these
        instead — or{" "}
        <Link href="/contact" className="link-underline text-accent">
          say hello
        </Link>{" "}
        if you expected something to be here.
      </p>

      <ul className="mt-10 divide-y divide-line border-y border-line sm:mt-12">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-baseline justify-between gap-4 py-4 transition-colors sm:py-5"
            >
              <span className="text-lg text-ink transition-colors group-hover:text-accent sm:text-xl">
                {item.label}
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                {item.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-[11px] uppercase tracking-[0.2em] text-faint">
        Dunfermline · Scotland · MBCS
      </p>
    </div>
  );
}
