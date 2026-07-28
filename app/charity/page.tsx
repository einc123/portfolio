import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { charityProjectSlugs } from "@/lib/caseStudySeo";
import { getProject, site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Charity & community work",
  description:
    "Charity web design in Fife by Euan Livingstone MBCS — Scout groups, Kinross After School Club, Fife Cycle Speedway, plus charity discounts and pro bono work.",
  alternates: { canonical: "/charity" },
  openGraph: {
    title: "Charity & community work — Euan Livingstone",
    description:
      "Supporting Fife charities and community groups with discounted and pro bono web design and development.",
    url: "/charity",
  },
  twitter: {
    card: "summary",
    title: "Charity & community work — Euan Livingstone",
    description:
      "Scout groups, KASC, Fife Cycle Speedway — and charity rates for organisations that need a clear site.",
  },
  keywords: [
    "charity web design Fife",
    "pro bono web design Scotland",
    "Scout website design",
    "Kinross After School Club",
    "Fife Cycle Speedway",
    "Euan Livingstone",
  ],
};

const focusSlugs = [
  "fife-cycle-speedway",
  "kasc",
  "dunfermline-scouts",
] as const;

const focusProjects = focusSlugs
  .map((slug) => getProject(slug))
  .filter((project): project is NonNullable<typeof project> => Boolean(project));

const moreCharityProjects = charityProjectSlugs
  .filter((slug) => !(focusSlugs as readonly string[]).includes(slug))
  .map((slug) => getProject(slug))
  .filter((project): project is NonNullable<typeof project> => Boolean(project));

const focusNotes: Record<string, string> = {
  "fife-cycle-speedway":
    "A grassroots club running Scotland’s fastest short-track cycling from Broomhead Parks in Dunfermline — riders, results and race-day energy needed a proper home beyond social posts.",
  kasc: "A Kinross registered charity providing wraparound childcare since 1991. Parents needed enrolment clarity, policies and trust signals without a cold corporate feel.",
  "dunfermline-scouts":
    "District Scouting across Fife — families, volunteers and camping — plus the original large camp that seeded ScoutCamp. One of several Scout charity sites I’ve built locally.",
};

export default function CharityPage() {
  return (
    <>
      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Charity", path: "/charity" },
          ]}
        />

        <p className="reveal mt-8 text-[11px] uppercase tracking-[0.18em] text-faint">
          Community · Charity · Fife
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 max-w-4xl font-display text-[clamp(2.5rem,11vw,5.25rem)] italic leading-[0.95] text-ink">
          Work that serves the community.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          A lot of my practice sits with charities and volunteer-led groups —
          Scout sections, after-school care, grassroots sport. They rarely have
          agency budgets, but they still need sites parents and members can
          trust. I offer charity rates, and I&apos;ve taken on pro bono work
          where it clearly helps.
        </p>

        <div className="reveal reveal-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Talk about a charity project
          </Link>
          <Link
            href="/work"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            All case studies
          </Link>
        </div>
      </div>

      <section className="page-pad mx-auto w-full max-w-6xl py-14 sm:py-20 md:py-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              How I help
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
              Charity rates &amp; pro bono.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted md:col-span-7 md:col-start-6 md:text-lg">
            <p>
              Registered charities and genuine community groups can ask about a{" "}
              <span className="text-ink">charity-based discount</span> on design
              and development. The goal is a site that works — enrolment, joining,
              volunteering, race days — without pricing community organisations
              out of good craft.
            </p>
            <p>
              I&apos;ve also done <span className="text-ink">pro bono</span>{" "}
              work where the need is clear and the scope is honest. That
              doesn&apos;t mean unlimited free agency time; it means agreeing a
              focused brief and shipping something useful.
            </p>
            <p className="text-sm md:text-base">
              Based in {site.location}. If you&apos;re a charity in Fife or
              further afield,{" "}
              <Link href="/contact" className="link-underline text-accent">
                get in touch
              </Link>{" "}
              or{" "}
              <Link href="/book" className="link-underline text-accent">
                book a chat
              </Link>{" "}
              and mention you&apos;re a charity from the start.
            </p>
          </div>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Spotlight
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
              Charity projects that shaped the practice.
            </h2>
          </div>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {focusProjects.map((project, index) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                className="group grid gap-3 py-8 transition-colors sm:py-10 md:grid-cols-12 md:gap-6"
              >
                <span className="text-sm text-faint md:col-span-1">
                  0{index + 1}
                </span>
                <div className="md:col-span-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
                    {project.slug === "fife-cycle-speedway"
                      ? "Grassroots sport"
                      : project.slug === "kasc"
                        ? "Childcare charity"
                        : "Scout charity"}
                  </p>
                  <h3 className="mt-2 text-xl text-ink transition-colors group-hover:text-accent sm:text-2xl">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {project.services.join(" · ")}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted md:col-span-5 md:text-base">
                  {focusNotes[project.slug] ?? project.summary}
                </p>
                <span className="text-sm text-accent md:col-span-2 md:self-center md:text-right">
                  Case study →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-14 sm:py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Scout groups &amp; related
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.85rem,5vw,2.75rem)] italic leading-[1.05] text-ink">
          More community sites in the Scout family.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Beyond the district site, I&apos;ve built for local Scout groups and
          Nine Acres Memorial Campsite — practical pages for joining,
          volunteering and camping across Fife.
        </p>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {moreCharityProjects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                className="group flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <h3 className="text-lg text-ink transition-colors group-hover:text-accent sm:text-xl">
                  {project.title}
                </h3>
                <p className="max-w-md text-sm text-muted sm:text-right">
                  {project.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-16 sm:pb-20">
        <div className="relative overflow-hidden border border-line bg-band px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            For charities &amp; community groups
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05]">
            Tell me what you need — and that you&apos;re a charity.
          </h2>
          <p className="mt-4 max-w-lg text-band-muted">
            Mention your charity status or community remit when you get in
            touch so we can talk honestly about discounts, scope and whether
            pro bono is a fit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3.5 text-sm font-medium text-[#0a0e0c]"
            >
              Book a chat
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-band-line px-7 py-3.5 text-sm font-medium text-white"
            >
              Contact
            </Link>
            <Link
              href="/dunfermline"
              className="inline-flex min-h-12 items-center justify-center text-sm text-white link-underline sm:ml-2"
            >
              Local Dunfermline page →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
