import Link from "next/link";
import { HeroTypewriter } from "@/components/HeroTypewriter";
import { LocalClock } from "@/components/LocalClock";
import { ProcessSteps } from "@/components/ProcessSteps";
import {
  about,
  awards,
  certifications,
  projects,
  qualifications,
  site,
  skills,
} from "@/lib/data";

export default function HomePage() {
  const featured = projects.filter((project) => project.featured).slice(0, 3);

  return (
    <>
      <section className="page-pad relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl flex-col justify-center pb-14 pt-6 sm:min-h-[calc(100vh-5.5rem)] sm:pb-16 sm:pt-8 md:pb-24 md:pt-4">
        <div
          className="pointer-events-none absolute -right-8 top-10 h-40 w-40 rounded-full bg-glow/40 blur-3xl sm:h-56 sm:w-56 md:right-10 md:h-72 md:w-72"
          style={{ animation: "float-soft 9s ease-in-out infinite" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-24 left-0 h-32 w-32 rounded-full bg-accent-soft/60 blur-3xl sm:h-40 sm:w-40"
          style={{ animation: "brand-pulse 7s ease-in-out infinite" }}
          aria-hidden
        />

        <p className="reveal max-w-full font-brand text-[10px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-accent break-anywhere sm:text-[11px] sm:tracking-[0.14em] md:text-sm">
          {site.brandLine}
        </p>

        <HeroTypewriter />

        <p className="reveal reveal-delay-2 mt-6 max-w-xl text-base leading-relaxed text-muted sm:mt-8 md:text-lg">
          Based in {site.location}. Six years across design, development and SEO
          — for local organisations and remote UK clients who want clear sites
          that actually ship.{" "}
          <Link href="/dunfermline" className="link-underline text-accent">
            Looking for a Dunfermline web designer / developer?
          </Link>
        </p>

        <div className="reveal reveal-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
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
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex min-h-12 w-12 shrink-0 self-start items-center justify-center border border-line bg-surface text-ink transition-colors hover:border-accent/40 hover:text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        <div className="reveal reveal-delay-3 mt-12 space-y-1.5 text-[11px] uppercase tracking-[0.2em] text-faint sm:mt-16">
          <p>Dunfermline · Scotland · MBCS</p>
          <p>
            <LocalClock />
          </p>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-28">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10 md:gap-y-12">
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              About
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05] text-ink">
              Design meets engineering.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted md:col-span-7 md:col-start-6 md:space-y-6 md:text-lg">
            <p>{about.summary}</p>
            <p>{about.career}</p>
            <p className="text-sm md:text-base">
              Read more{" "}
              <Link href="/about" className="link-underline text-accent">
                about me
              </Link>
              , browse{" "}
              <Link href="/work" className="link-underline text-accent">
                selected work
              </Link>
              , see{" "}
              <Link href="/charity" className="link-underline text-accent">
                charity &amp; community projects
              </Link>
              , find{" "}
              <Link href="/dunfermline" className="link-underline text-accent">
                web design &amp; development in Dunfermline
              </Link>
              , or{" "}
              <Link href="/book" className="link-underline text-accent">
                book a consultation
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-10 md:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Selected work
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05] text-ink">
              Recent projects.
            </h2>
          </div>
          <Link
            href="/work"
            className="link-underline self-start text-sm text-accent sm:self-auto"
          >
            All work
          </Link>
        </div>

        <ul className="mt-10 grid gap-10 sm:mt-12 sm:gap-8 md:grid-cols-3 md:gap-8 lg:gap-10">
          {featured.map((project, index) => (
            <li key={project.slug} className="min-w-0">
              <Link
                href={`/work/${project.slug}`}
                className="group flex h-full flex-col border-t border-line pt-5 transition-colors sm:pt-6"
              >
                <span className="text-sm text-faint">0{index + 1}</span>
                <h3 className="mt-4 text-[1.35rem] leading-tight text-ink transition-colors group-hover:text-accent sm:text-2xl">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {project.services.join(" · ")}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {project.summary}
                </p>
                <span className="mt-6 text-sm text-accent">Case study →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProcessSteps />

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-24">
        <div className="grid gap-8 border border-line bg-surface px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-12 md:gap-10 md:px-12 md:py-14">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Charity &amp; community
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
              Supporting the groups that keep Fife going.
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-6 md:col-span-6 md:col-start-7">
            <p className="text-base leading-relaxed text-muted md:text-lg">
              Scout groups, Kinross After School Club, Fife Cycle Speedway and
              more — with charity discounts and pro bono work where it helps.
            </p>
            <Link
              href="/charity"
              className="inline-flex min-h-11 w-fit items-center text-sm text-accent link-underline"
            >
              Read about charity work →
            </Link>
          </div>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Credentials
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05] text-ink">
          Qualifications, awards &amp; practice.
        </h2>

        <div className="mt-10 grid gap-12 sm:mt-14 md:grid-cols-3 md:gap-16">
          <CredentialList title="Qualifications" items={qualifications} />
          <CredentialList title="Awards" items={awards} />
          <CredentialList title="Certifications" items={certifications} />
        </div>

        <div className="mt-12 grid gap-10 border-t border-line pt-10 sm:mt-16 sm:pt-12 md:grid-cols-2">
          <SkillTags title="Design" tags={skills.design} />
          <SkillTags title="Development" tags={skills.development} />
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-8">
        <div className="relative overflow-hidden border border-line bg-band px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-20">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            Next step
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05]">
            Ready to start your next project?
          </h2>
          <p className="mt-4 max-w-lg text-band-muted">
            Book a consultation directly in my calendar, send a note, see{" "}
            <Link href="/charity" className="link-underline text-white">
              charity work
            </Link>
            , or{" "}
            <Link href="/dunfermline" className="link-underline text-white">
              local Dunfermline work
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3.5 text-sm font-medium text-[#0a0e0c] transition-transform hover:-translate-y-0.5"
            >
              Book a chat
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-band-line px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/50"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CredentialList({
  title,
  items,
}: {
  title: string;
  items: readonly { title: string; org: string; year: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
        {title}
      </p>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={`${item.title}-${item.year}`} className="border-t border-line pt-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.org}</p>
              </div>
              <span className="shrink-0 text-sm text-faint">{item.year}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillTags({
  title,
  tags,
}: {
  title: string;
  tags: readonly string[];
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
        {title}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent/40 hover:text-accent"
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
