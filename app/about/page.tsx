import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { aboutPage, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} MBCS — Fife-born web designer and developer in Dunfermline. Scouting, Bundle Group, bagpipes, Disney, Tesco and a BSc from Edinburgh Napier.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Euan Livingstone",
    description: `The story behind ${site.name} — Dunfermline roots, Scouting, education, charity events and web design.`,
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "About — Euan Livingstone",
    description:
      "Fife-born web designer & developer, Scout leader, bagpiper and Bundle Group co-founder.",
  },
  keywords: [
    "Euan Livingstone",
    "about",
    "Dunfermline",
    "Fife",
    "web designer",
    "MBCS",
    "Scouts",
    "bagpipes",
  ],
};

const bagpipesMailto = `mailto:${site.email}?subject=${encodeURIComponent(
  "Bagpipes booking enquiry",
)}&body=${encodeURIComponent(
  "Hi Euan,\n\nI'd like to ask about booking the bagpipes for an event.\n\nDate:\nLocation:\nOccasion:\n\nThanks!",
)}`;

export default function AboutPage() {
  return (
    <>
      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]}
        />

        <p className="reveal mt-8 text-[11px] uppercase tracking-[0.18em] text-faint">
          About me
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 max-w-4xl font-display text-[clamp(2.5rem,11vw,5.25rem)] italic leading-[0.95] text-ink">
          More than the portfolio.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          {aboutPage.intro}
        </p>

        <div className="reveal reveal-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Book a chat
          </Link>
          <Link
            href="/work"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent/40"
          >
            View work
          </Link>
        </div>
      </div>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Roots
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05] text-ink">
              Dunfermline, Fife-born.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-muted md:col-span-7 md:col-start-6 md:text-lg">
            {aboutPage.roots}
          </p>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl border-t border-line py-16 sm:py-20 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Education
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05] text-ink">
          From Queen Anne to Napier.
        </h2>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {aboutPage.education.map((item) => (
            <li
              key={item.title}
              className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-6 md:py-8"
            >
              <h3 className="text-lg font-medium text-ink md:col-span-5">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted md:col-span-7 md:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Work &amp; community
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05] text-ink">
          Disney, Tesco &amp; Bundle Group.
        </h2>
        <ul className="mt-10 space-y-10">
          {aboutPage.work.map((item) => (
            <li key={item.title} className="max-w-3xl">
              <h3 className="text-lg font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl border-t border-line py-16 sm:py-20 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Scouting
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05] text-ink">
              Still in the movement.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Scouting has been part of my life since childhood — now it includes
              digital leadership, outdoor instruction and international service.
            </p>
          </div>
          <ul className="space-y-4 md:col-span-6 md:col-start-7">
            {aboutPage.scouting.map((item) => (
              <li
                key={item}
                className="border-t border-line pt-4 text-base leading-relaxed text-muted first:border-t-0 first:pt-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-24">
        <div className="relative overflow-hidden border border-line bg-band px-6 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            Also · bagpipes
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05]">
            Websites by day. Pipes by request.
          </h2>
          <p className="mt-4 max-w-xl text-band-muted">{aboutPage.bagpipes}</p>
          <a
            href={bagpipesMailto}
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-white px-7 py-3.5 text-sm font-medium text-[#0a0e0c] transition-transform hover:-translate-y-0.5"
          >
            {aboutPage.bagpipesCta}
          </a>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-8 sm:pb-12">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Awards &amp; recognition
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,7vw,3.25rem)] italic leading-[1.05] text-ink">
          A few milestones.
        </h2>
        <ul className="mt-8 flex flex-wrap gap-2">
          {aboutPage.awards.map((award) => (
            <li
              key={award}
              className="border border-line bg-surface px-3 py-1.5 text-sm text-ink"
            >
              {award}
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-10 sm:flex-row sm:items-center">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Get in touch
          </Link>
          <Link
            href="/charity"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent/40"
          >
            Charity work
          </Link>
        </div>
      </section>
    </>
  );
}
