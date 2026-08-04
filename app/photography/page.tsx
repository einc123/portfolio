import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PhotographyCarousel } from "@/components/PhotographyCarousel";
import { site } from "@/lib/data";
import { photographyImages, photographyPage } from "@/lib/photography";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  title: seo.photography.title,
  description: seo.photography.description,
  alternates: { canonical: "/photography" },
  openGraph: {
    title: `${seo.photography.title} — Euan Livingstone`,
    description:
      "Freelance stills and licensed aerial photography across Scotland — Fujifilm X-M5 and DJI Mini 3.",
    url: "/photography",
    images: [{ url: photographyImages[0].src }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${seo.photography.title} — Euan Livingstone`,
    description:
      "Still photography and licensed drone photography — Fujifilm X-M5 and DJI Mini 3.",
  },
  keywords: [
    "photography Dunfermline",
    "drone photography Scotland",
    "architectural photography",
    "licensed drone operator",
    "Fujifilm X-M5",
    "DJI Mini 3",
    "freelance photographer Fife",
    "Euan Livingstone",
  ],
};

export default function PhotographyPage() {
  const hero = photographyImages[0];

  return (
    <>
      <section className="relative min-h-[min(88svh,52rem)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.src}
          alt={hero.alt}
          width={2400}
          height={1600}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0e0c] via-[#0a0e0c]/55 to-[#0a0e0c]/20"
          aria-hidden
        />
        <div className="page-pad relative mx-auto flex min-h-[min(88svh,52rem)] w-full max-w-6xl flex-col justify-end pb-12 pt-8 sm:pb-16 sm:pt-10 md:pb-20">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Photography", path: "/photography" },
            ]}
            className="[&_ol]:text-white/55 [&_a]:text-white/75 [&_a:hover]:text-white [&_[aria-current]]:text-white/90 [&_[aria-hidden]]:text-white/35"
          />
          <p className="reveal mt-10 font-brand text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 sm:text-sm">
            {site.brand} · {photographyPage.eyebrow}
          </p>
          <h1 className="reveal reveal-delay-1 mt-4 max-w-4xl font-display text-[clamp(2.75rem,12vw,5.75rem)] italic leading-[0.92] text-white">
            {photographyPage.title}
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-white/78 sm:mt-6 md:text-lg">
            {photographyPage.intro}
          </p>
          <div className="reveal reveal-delay-3 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3.5 text-sm font-medium text-[#0a0e0c] transition-transform hover:-translate-y-0.5"
            >
              Book a shoot
            </Link>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(
                "Photography enquiry",
              )}`}
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/70"
            >
              Enquire
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-[#0a0e0c] px-0 py-14 text-white sm:py-16 md:py-20">
        <div className="page-pad mx-auto w-full max-w-6xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
            Selected frames
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.5rem)] italic leading-[1.05] text-white">
            Recent photographs.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
            Location and architectural work from recent shoots — a sense of the
            eye behind the practice.
          </p>
        </div>
        <div className="page-pad mx-auto mt-10 w-full max-w-6xl">
          <PhotographyCarousel images={photographyImages} />
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Services
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
          Two ways to shoot.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          <article className="border border-line bg-surface px-5 py-7 sm:px-6 sm:py-8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Still
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] italic leading-[1.05] text-ink">
              {photographyPage.ground.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {photographyPage.ground.body}
            </p>
          </article>
          <article className="border border-line bg-surface px-5 py-7 sm:px-6 sm:py-8">
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Aerial
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] italic leading-[1.05] text-ink">
              {photographyPage.aerial.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {photographyPage.aerial.body}
            </p>
          </article>
        </div>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-16 sm:pb-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Kit
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
          Camera and drone.
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {photographyPage.gear.map((item) => (
            <li
              key={item.name}
              className="border border-line bg-surface px-5 py-6 sm:px-6 sm:py-7"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
                {item.role}
              </p>
              <h3 className="mt-3 font-display text-2xl italic text-ink sm:text-3xl">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
        <ul className="mt-8 space-y-2 text-sm text-muted">
          {photographyPage.notes.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="text-faint" aria-hidden>
                —
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-8">
        <div className="relative overflow-hidden border border-line bg-band px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            {photographyPage.cta.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05]">
            {photographyPage.cta.title}
          </h2>
          <p className="mt-4 max-w-lg text-band-muted">
            {photographyPage.cta.body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center bg-white px-7 py-3.5 text-sm font-medium text-[#0a0e0c] transition-transform hover:-translate-y-0.5"
            >
              Book a shoot
            </Link>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(
                "Photography enquiry",
              )}`}
              className="inline-flex min-h-12 items-center justify-center border border-band-line px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/50"
            >
              Email {site.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
