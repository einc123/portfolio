import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ManageCookiesButton } from "@/components/ManageCookiesButton";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cookies policy",
  description: `Cookies and local storage policy for ${site.name}'s portfolio at ${site.url} — essential preferences, cookieless Cloudflare analytics and third-party embeds.`,
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookies policy — Euan Livingstone",
    description:
      "How this site uses essential storage, cookieless analytics and third-party embeds.",
    url: "/cookies",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const updated = "28 July 2026";

export default function CookiesPage() {
  return (
    <div className="page-pad mx-auto w-full max-w-3xl pb-16 pt-6 sm:pt-8 md:pt-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Cookies", path: "/cookies" },
        ]}
      />

      <p className="reveal mt-8 text-[11px] uppercase tracking-[0.18em] text-faint">
        Legal
      </p>
      <h1 className="reveal reveal-delay-1 mt-4 font-display text-[clamp(2.5rem,11vw,4.5rem)] italic leading-[0.95] text-ink">
        Cookies policy.
      </h1>
      <p className="reveal reveal-delay-2 mt-5 text-sm text-muted">
        Last updated {updated}
      </p>
      <p className="reveal reveal-delay-2 mt-6 text-base leading-relaxed text-muted md:text-lg">
        This page explains how {site.name} ({site.url}) uses cookies, local
        storage and similar technologies.
      </p>

      <div className="reveal reveal-delay-3 mt-6">
        <ManageCookiesButton className="link-underline text-sm text-accent" />
      </div>

      <div className="mt-12 space-y-10 text-base leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl italic text-ink">
            1. Who this applies to
          </h2>
          <p className="mt-3">
            This policy covers the portfolio site operated by {site.name}, based
            in {site.location}. Contact:{" "}
            <a
              href={`mailto:${site.email}`}
              className="link-underline text-accent"
            >
              {site.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl italic text-ink">
            2. Essential storage
          </h2>
          <p className="mt-3">
            These are needed for the site to remember choices you make. They are
            not used for advertising. Most use{" "}
            <strong className="font-medium text-ink">localStorage</strong> or{" "}
            <strong className="font-medium text-ink">sessionStorage</strong> in
            your browser rather than traditional HTTP cookies:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Theme preference (light / dark)</li>
            <li>Accent colour preference</li>
            <li>Whether you have seen the loading intro this session</li>
            <li>Option to skip the loading animation</li>
            <li>Whether you have dismissed the privacy notice</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl italic text-ink">
            3. Analytics (cookieless)
          </h2>
          <p className="mt-3">
            This site may use{" "}
            <strong className="font-medium text-ink">
              Cloudflare Web Analytics
            </strong>
            . It is designed to be privacy-oriented and{" "}
            <strong className="font-medium text-ink">does not use cookies</strong>{" "}
            for measurement, so there is no separate analytics opt-in toggle.
          </p>
          <p className="mt-3">
            Analytics may be enabled via Cloudflare Pages / the Cloudflare
            dashboard, or via a site beacon token. Either way, it does not set
            advertising cookies in your browser.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl italic text-ink">
            4. Third-party embeds
          </h2>
          <p className="mt-3">
            Some pages embed third-party services that may set their own cookies
            when you interact with them — for example{" "}
            <strong className="font-medium text-ink">Google Calendar</strong> on
            the booking page. Those cookies are controlled by Google under their
            own policies. Avoid those pages if you do not want third-party
            embed cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl italic text-ink">
            5. Your choices
          </h2>
          <p className="mt-3">
            Use the privacy notice to acknowledge this information. You can clear
            site data in your browser settings, or use{" "}
            <ManageCookiesButton className="link-underline text-accent" /> to
            show the notice again.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl italic text-ink">6. Changes</h2>
          <p className="mt-3">
            This policy may be updated when the site’s storage or analytics setup
            changes. The “Last updated” date at the top will change when it does.
          </p>
        </section>
      </div>

      <p className="mt-14 text-sm text-muted">
        Questions?{" "}
        <Link href="/contact" className="link-underline text-accent">
          Contact
        </Link>{" "}
        or email{" "}
        <a href={`mailto:${site.email}`} className="link-underline text-accent">
          {site.email}
        </a>
        .
      </p>
    </div>
  );
}
