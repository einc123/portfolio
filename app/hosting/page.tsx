import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HostingOptions } from "@/components/HostingOptions";
import { site } from "@/lib/data";
import { parseHostingOption } from "@/lib/hosting";
import { seo } from "@/lib/seo";

export const metadata: Metadata = {
  title: seo.hosting.title,
  description: seo.hosting.description,
  alternates: { canonical: "/hosting" },
  openGraph: {
    title: `${seo.hosting.title} — Euan Livingstone`,
    description:
      "Compare managed Euan Hosting on OVH with unmanaged Spaceship, Verpex, or bring-your-own hosting.",
    url: "/hosting",
  },
  twitter: {
    card: "summary",
    title: `${seo.hosting.title} — Euan Livingstone`,
    description:
      "Managed OVH hosting with optional maintenance, or unmanaged Spaceship / Verpex / your own provider.",
  },
  keywords: [
    "website hosting Scotland",
    "managed web hosting",
    "OVH hosting",
    "Spaceship hosting",
    "Verpex hosting",
    "website maintenance plan",
    "freelance web hosting",
    "Euan Livingstone",
  ],
};

type Props = {
  searchParams: Promise<{ option?: string }>;
};

export default async function HostingPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialOption = parseHostingOption(params.option);

  return (
    <>
      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Hosting", path: "/hosting" },
          ]}
        />

        <p className="reveal reveal-delay-1 mt-8 text-[11px] uppercase tracking-[0.18em] text-faint">
          Hosting · Domains · Care
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 max-w-4xl font-display text-[clamp(2.5rem,11vw,5.25rem)] italic leading-[0.95] text-ink">
          Where your site lives.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          Pick the path that matches how you want the site looked after.
          Managed builds stay on{" "}
          <span className="font-brand font-semibold tracking-tight text-ink">
            {"<! Euan Hosting />"}
          </span>{" "}
          — OVH, in-house. Unmanaged builds with no maintenance package use
          Spaceship, Verpex, or hosting you already have.
        </p>
      </div>

      <section className="page-pad mx-auto w-full max-w-6xl py-12 sm:py-16 md:py-20">
        <Suspense
          fallback={
            <div className="min-h-[24rem] border border-line bg-surface" />
          }
        >
          <HostingOptions initialOption={initialOption} />
        </Suspense>
      </section>

      <section className="page-pad mx-auto w-full max-w-6xl pb-16 sm:pb-20">
        <div className="relative overflow-hidden border border-line bg-band px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14 md:py-16">
          <div
            className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-band-faint">
            Not sure which fits
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05]">
            I can help you decide in a short call.
          </h2>
          <p className="mt-4 max-w-lg text-band-muted">
            Managed on OVH, Spaceship or Verpex self-serve, or a host you
            already use — say what you need and I&apos;ll map the cleanest
            option.
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
              Contact {site.name.split(" ")[0]}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
