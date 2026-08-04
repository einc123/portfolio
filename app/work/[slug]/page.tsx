import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HighlightedCopy } from "@/components/HighlightedCopy";
import { JsonLd } from "@/components/JsonLd";
import {
  accentVar,
  getCaseStudyCssVars,
  getCaseStudyTheme,
  swatchLabelColour,
} from "@/lib/caseStudyTheme";
import {
  findCaseStudyBySlug,
  getAdjacentCaseStudies,
} from "@/lib/caseStudies";
import { site } from "@/lib/data";
import { caseStudyJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await findCaseStudyBySlug(slug);
  if (!found) return { title: "Case study" };

  const { project, seo: seoCopy } = found;

  return {
    title: seoCopy.title,
    description: seoCopy.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: seoCopy.title,
      description: seoCopy.description,
      url: `/work/${project.slug}`,
      type: "article",
      images: [
        {
          url: project.logo,
          alt: `${project.title} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: seoCopy.title,
      description: seoCopy.description,
      images: [project.logo],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const found = await findCaseStudyBySlug(slug);
  if (!found) notFound();

  const { project, seo: seoCopy } = found;
  const { prev, next } = await getAdjacentCaseStudies(slug);
  const cssVars = getCaseStudyCssVars(project);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ];

  return (
    <article
      className="case-study page-pad mx-auto w-full max-w-6xl pb-16 pt-6 sm:pt-8 md:pt-12"
      style={cssVars as CSSProperties}
    >
      <JsonLd
        data={caseStudyJsonLd({
          title: project.title,
          description: seoCopy.description,
          path: `/work/${project.slug}`,
          datePublished: `${project.year}-01-01`,
          image: project.logo,
        })}
      />

      <Breadcrumbs items={crumbs} className="mb-8 sm:mb-10" />

      <div className="mt-2 grid gap-8 sm:gap-10 md:grid-cols-12 md:items-end md:gap-12">
        <div className="min-w-0 md:col-span-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--case-primary)]">
            Case study · {project.year}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,10vw,5rem)] italic leading-[0.95] text-[var(--case-primary)] sm:mt-4">
            {project.title}
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-snug text-ink sm:mt-5 md:text-lg">
            {seoCopy.headline}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            <HighlightedCopy text={project.summary} project={project} />
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            {project.slug === "euanliv" ? (
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center bg-[var(--case-primary)] px-6 py-3 text-sm font-medium text-[var(--case-on-primary)] transition-opacity hover:opacity-90"
              >
                View live site
              </Link>
            ) : (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center bg-[var(--case-primary)] px-6 py-3 text-sm font-medium text-[var(--case-on-primary)] transition-opacity hover:opacity-90"
              >
                Visit live site
              </a>
            )}
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center border px-6 py-3 text-sm font-medium text-ink transition-colors"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--case-primary) 35%, transparent)",
              }}
            >
              Book a similar project
            </Link>
            <p className="text-sm text-muted sm:flex sm:items-center">
              {project.services.map((service, index) => (
                <span key={service}>
                  {index > 0 ? <span className="text-faint"> · </span> : null}
                  <span style={{ color: accentVar(index) }}>{service}</span>
                </span>
              ))}
            </p>
          </div>
        </div>

        <div
          className="flex min-h-[180px] items-center justify-center border p-8 sm:min-h-[220px] sm:p-10 md:col-span-5 md:min-h-[280px]"
          style={{
            borderColor:
              "color-mix(in srgb, var(--case-primary) 28%, transparent)",
            backgroundColor: project.logoLight
              ? "#e4e8e6"
              : "color-mix(in srgb, var(--case-primary) 12%, transparent)",
          }}
        >
          <Image
            src={project.logo}
            alt={`${project.title} logo — web design case study by ${site.name}`}
            width={320}
            height={200}
            className="h-auto max-h-36 w-auto max-w-full object-contain sm:max-h-44"
            priority
          />
        </div>
      </div>

      <div
        className="mt-10 h-1.5 w-full sm:mt-12"
        style={{
          background: `linear-gradient(90deg, ${project.colours.map((c) => c.hex).join(", ")})`,
        }}
        aria-hidden
      />

      <section className="mt-10 grid gap-4 border-t border-line pt-10 sm:mt-14 sm:gap-10 sm:pt-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--case-primary)]">
            Overview
          </p>
        </div>
        <p className="text-base leading-relaxed text-muted md:col-span-8 md:text-lg">
          <HighlightedCopy text={project.overview} project={project} />
        </p>
      </section>

      <section className="mt-10 grid gap-8 sm:mt-12 md:grid-cols-3">
        {[
          { label: "Challenge", body: project.challenge },
          { label: "Solution", body: project.solution },
          { label: "Outcome", body: project.outcome },
        ].map((block, index) => (
          <div
            key={block.label}
            className="border-t pt-5"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar(index)} 40%, transparent)`,
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ color: accentVar(index) }}
            >
              {block.label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
              <HighlightedCopy text={block.body} project={project} />
            </p>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-10 border-t border-line pt-10 sm:mt-16 sm:gap-12 sm:pt-12 md:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--case-primary)]">
            Design tools
          </p>
          <p className="mt-2 text-sm text-muted">
            Designed in{" "}
            <span className="font-medium text-[var(--case-primary)]">Figma</span>{" "}
            with brand and visual assets crafted in Adobe Illustrator and Adobe
            Photoshop.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.designTools.map((tool, index) => (
              <li
                key={tool}
                className="border px-3 py-1.5 text-sm"
                style={{
                  borderColor: `color-mix(in srgb, ${accentVar(index)} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accentVar(index)} 10%, transparent)`,
                  color: accentVar(index),
                }}
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--case-secondary)]">
            Built with
          </p>
          <p className="mt-2 text-sm text-muted">
            Languages and technologies used to deliver the live experience.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((item, index) => (
              <li
                key={item}
                className="border px-3 py-1.5 text-sm"
                style={{
                  borderColor: `color-mix(in srgb, ${accentVar(index)} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accentVar(index)} 10%, transparent)`,
                  color: accentVar(index),
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-12">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--case-primary)]">
          Colour palette
        </p>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Brand swatches below. UI accents on this page are nudged where needed
          so they stay readable on the site background.
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 md:grid-cols-6">
          {project.colours.map((colour) => {
            const nameColour = swatchLabelColour(colour.hex);

            return (
              <li
                key={colour.hex}
                className="border bg-surface p-3"
                style={{
                  borderColor: `color-mix(in srgb, ${colour.hex} 35%, transparent)`,
                }}
              >
                <div
                  className="aspect-[4/3] w-full border border-line/60"
                  style={{ backgroundColor: colour.hex }}
                  aria-hidden
                />
                <p
                  className={`mt-3 text-sm font-medium ${nameColour ? "" : "text-ink"}`}
                  style={nameColour ? { color: nameColour } : undefined}
                >
                  {colour.name}
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wide text-faint">
                  {colour.hex}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 border border-line bg-surface px-5 py-8 sm:mt-16 sm:px-8 sm:py-10">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Next step
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.75rem,5vw,2.5rem)] italic leading-[1.05] text-ink">
          Need something in this vein?
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Whether you&apos;re a{" "}
          <Link href="/dunfermline" className="link-underline text-accent">
            Dunfermline or Fife organisation
          </Link>{" "}
          or a remote UK client, I can take a brief from first sketch through to
          a live site. See{" "}
          <Link href="/work" className="link-underline text-accent">
            more work
          </Link>
          ,{" "}
          <Link href="/contact" className="link-underline text-accent">
            send a note
          </Link>
          , or{" "}
          <Link href="/book" className="link-underline text-accent">
            book a chat
          </Link>
          .
        </p>
      </section>

      <nav className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-10">
        {prev ? (
          <Link
            href={`/work/${prev.slug}`}
            className="group min-w-0 text-sm text-muted transition-colors hover:text-ink"
          >
            <span className="block text-[11px] uppercase tracking-[0.16em] text-faint">
              Previous
            </span>
            <span
              className="case-nav-link mt-1 inline-block link-underline break-anywhere"
              style={
                {
                  ["--nav-c"]: getCaseStudyTheme(prev).light.primary,
                  ["--nav-c-d"]: getCaseStudyTheme(prev).dark.primary,
                } as CSSProperties
              }
            >
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/work/${next.slug}`}
            className="group min-w-0 text-sm text-muted transition-colors hover:text-ink sm:text-right"
          >
            <span className="block text-[11px] uppercase tracking-[0.16em] text-faint">
              Next
            </span>
            <span
              className="case-nav-link mt-1 inline-block link-underline break-anywhere"
              style={
                {
                  ["--nav-c"]: getCaseStudyTheme(next).light.primary,
                  ["--nav-c-d"]: getCaseStudyTheme(next).dark.primary,
                } as CSSProperties
              }
            >
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
