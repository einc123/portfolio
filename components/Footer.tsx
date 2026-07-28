import Link from "next/link";
import { AccentSwapper } from "@/components/AccentSwapper";
import { LocalClock } from "@/components/LocalClock";
import { ThemeModeSwapper } from "@/components/ThemeModeSwapper";
import { nav, site } from "@/lib/data";

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line sm:mt-24">
      <div className="page-pad mx-auto grid w-full max-w-6xl gap-10 py-12 sm:gap-12 sm:py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="font-brand text-base font-semibold tracking-tight text-ink sm:text-lg">
            {site.brand}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Web design and development from Dunfermline, Scotland — balancing
            craft, clarity and performance.
          </p>
          <Link
            href="/book"
            className="mt-6 inline-flex min-h-11 items-center link-underline text-sm text-accent"
          >
            Book a chat
          </Link>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Navigation
          </p>
          <ul className="mt-3 space-y-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="link-underline inline-flex py-1 text-sm text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/charity"
                className="link-underline inline-flex py-1 text-sm text-foreground"
              >
                Charity work
              </Link>
            </li>
            <li>
              <Link
                href="/dunfermline"
                className="link-underline inline-flex py-1 text-sm text-foreground"
              >
                Dunfermline
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Contact
          </p>
          <ul className="mt-3 space-y-0.5 text-sm text-foreground">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="link-underline break-anywhere inline-flex py-1"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex py-1"
              >
                LinkedIn
              </a>
            </li>
            <li className="pt-2 text-muted">
              <span className="inline-flex items-center gap-1.5">
                <PinIcon className="h-3.5 w-3.5 shrink-0 text-faint" />
                <Link
                  href="/dunfermline"
                  className="link-underline transition-colors hover:text-accent"
                >
                  {site.location}
                </Link>
              </span>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-faint">
                <LocalClock />
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="page-pad mx-auto flex w-full max-w-6xl flex-col gap-4 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ThemeModeSwapper />
            <AccentSwapper />
          </div>
          <p className="sm:text-right">Professional Member of BCS (MBCS)</p>
        </div>
      </div>
    </footer>
  );
}
