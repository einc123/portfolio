import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ProcessSteps } from "@/components/ProcessSteps";
import { localProjectSlugs } from "@/lib/caseStudySeo";
import { getProject, site } from "@/lib/data";
import { professionalServiceJsonLd, seo } from "@/lib/seo";

export const metadata: Metadata = {
  title: seo.local.title,
  description: seo.local.description,
  alternates: { canonical: "/dunfermline" },
  openGraph: {
    title: seo.local.title,
    description: seo.local.ogDescription,
    url: "/dunfermline",
  },
  twitter: {
    card: "summary",
    title: seo.local.title,
    description: seo.local.ogDescription,
  },
  keywords: [
    "web designer Dunfermline",
    "web developer Dunfermline",
    "web designer Fife",
    "web developer Fife",
    "website design Scotland",
    "Euan Livingstone",
    "MBCS",
  ],
};

const localProjects = localProjectSlugs
  .map((slug) => getProject(slug))
  .filter((project): project is NonNullable<typeof project> => Boolean(project));

export default function DunfermlinePage() {
  return (
    <>
      <JsonLd data={professionalServiceJsonLd()} />

      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Dunfermline", path: "/dunfermline" },
          ]}
        />

        <p className="reveal mt-8 text-[11px] uppercase tracking-[0.18em] text-faint">
          Local · Dunfermline &amp; Fife
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 max-w-4xl font-display text-[clamp(2.5rem,11vw,5.25rem)] italic leading-[0.95] text-ink">
          Web designer &amp; developer in Dunfermline.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          I&apos;m {site.name} BSc MBCS — an independent web designer and developer
          based in {site.location}. I build clear, production-ready sites for
          local organisations (Scout groups, clubs, charities) and for remote UK
          clients who want the same care without the agency overhead.
        </p>

        <div className="reveal reveal-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Book a chat
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            Contact
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center text-sm text-accent link-underline sm:ml-2"
          >
            Main portfolio →
          </Link>
        </div>
      </div>

      <section className="page-pad mx-auto w-full max-w-6xl py-14 sm:py-20 md:py-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Who this is for
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
              Local roots. UK-wide work.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted md:col-span-7 md:col-start-6 md:text-lg">
            <p>
              If you&apos;re a Dunfermline or Fife organisation that needs a
              website parents, members or volunteers can actually use — I&apos;m
              nearby, and I already know the texture of local Scout, club and
              charity briefs.
            </p>
            <p>
              If you&apos;re further afield, the same process applies: planning,
              Figma design, development, refinements and launch. Start from the{" "}
              <Link href="/" className="link-underline text-accent">
                main portfolio
              </Link>{" "}
              or jump straight to{" "}
              <Link href="/work" className="link-underline text-accent">
                case studies
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Local work
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
              Projects with a Fife footprint.
            </h2>
          </div>
          <Link
            href="/work"
            className="link-underline self-start text-sm text-accent sm:self-auto"
          >
            All work
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {localProjects.map((project, index) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                className="group grid gap-2 py-7 transition-colors sm:py-8 md:grid-cols-12 md:items-baseline md:gap-6"
              >
                <span className="text-sm text-faint md:col-span-1">
                  0{index + 1}
                </span>
                <div className="md:col-span-4">
                  <h3 className="text-xl text-ink transition-colors group-hover:text-accent sm:text-2xl">
                    {project.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted md:col-span-5">
                  {project.summary}
                </p>
                <span className="text-sm text-accent md:col-span-2 md:text-right">
                  Case study →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProcessSteps
        eyebrow="How it works"
        heading="From first chat to launch."
        intro="Whether you're down the road in Dunfermline or booking remotely, the path stays the same — clear steps, no mystery agency process."
      />

      <section className="page-pad mx-auto w-full max-w-6xl pb-16 pt-4 sm:pb-20">
        <div className="relative overflow-hidden border border-line bg-band px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            Based in {site.location}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05]">
            Tell me what you need built.
          </h2>
          <p className="mt-4 max-w-lg text-band-muted">
            Email{" "}
            <a
              href={`mailto:${site.email}`}
              className="link-underline text-white"
            >
              {site.email}
            </a>{" "}
            or pick a slot in the calendar.
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
          </div>
        </div>
      </section>
    </>
  );
}
