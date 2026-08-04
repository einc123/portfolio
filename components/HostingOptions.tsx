"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";
import { SpaceshipLogo } from "@/components/SpaceshipLogo";
import { VerpexLogo } from "@/components/VerpexLogo";
import { site } from "@/lib/data";
import {
  parseHostingOption,
  type HostingOption,
} from "@/lib/hosting";

const tabs: { id: HostingOption; label: string }[] = [
  { id: "euan", label: "<! Euan Hosting />" },
  { id: "spaceship", label: "Spaceship" },
  { id: "verpex", label: "Verpex" },
];

const euanPoints = [
  {
    title: "Managed on OVH",
    body: "Your site is hosted in-house on top-of-the-line OVH infrastructure — not a shared “set and forget” box you have to babysit.",
  },
  {
    title: "With or without maintenance",
    body: "Choose a managed website with an ongoing maintenance plan, or managed hosting without one if you only need a solid home for the build.",
  },
  {
    title: "One relationship",
    body: "Design, development and hosting stay with the same person. Updates, SSL, backups and uptime questions don’t bounce between vendors.",
  },
] as const;

const spaceshipPoints = [
  {
    title: "Domains",
    body: "Search, register and manage domains with modern tools — from classic .com through to the extensions your brand needs.",
  },
  {
    title: "Web hosting",
    body: "High-performance hosting for WordPress and beyond, with plans that scale from a first site to heavier workloads.",
  },
  {
    title: "Email & extras",
    body: "Spacemail for business addresses on your domain, plus SSL and the Unbox flow that connects products without fiddly setup.",
  },
] as const;

const verpexPoints = [
  {
    title: "Web & WordPress hosting",
    body: "Fast shared and managed WordPress plans with free SSL, daily backups and Softaculous one-click installs for the stack you already know.",
  },
  {
    title: "cPanel & global network",
    body: "Industry-standard cPanel control, UK and worldwide data centres, and migrations handled for you when you move over.",
  },
  {
    title: "24/7 support",
    body: "Human support around the clock, free SSL on every domain, and a 30-day money-back guarantee on hosting plans.",
  },
] as const;

export function HostingOptions({
  initialOption = "euan",
}: {
  initialOption?: HostingOption;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const option = parseHostingOption(searchParams.get("option") ?? initialOption);
  const baseId = useId();

  function select(next: HostingOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "euan") params.delete("option");
    else params.set("option", next);
    const query = params.toString();
    router.replace(query ? `/hosting?${query}` : "/hosting", { scroll: false });
  }

  return (
    <div>
      <div
        className="flex flex-col gap-2 border border-line bg-surface p-1.5 sm:inline-flex sm:flex-row sm:flex-wrap"
        role="tablist"
        aria-label="Hosting options"
      >
        {tabs.map((tab) => {
          const active = option === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => select(tab.id)}
              className={`min-h-11 px-4 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-center ${
                active
                  ? "bg-ink text-background"
                  : "text-muted hover:text-ink"
              } ${tab.id === "euan" ? "font-brand font-semibold tracking-tight" : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-euan`}
        aria-labelledby={`${baseId}-euan`}
        hidden={option !== "euan"}
        className="mt-10 sm:mt-12"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          Managed · In-house · OVH
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05] text-ink">
          Fully hosted with me — on OVH.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          If you go for a managed website — with or without a maintenance plan —
          hosting stays in-house on top-of-the-line OVH software. You get a
          production-ready home for the site without shopping for a stack
          yourself.
        </p>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {euanPoints.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-3 py-8 sm:py-10 md:grid-cols-12 md:gap-6"
            >
              <span className="text-sm text-faint md:col-span-1">
                0{index + 1}
              </span>
              <h3 className="text-xl text-ink sm:text-2xl md:col-span-4">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted md:col-span-7 md:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Book a chat about managed hosting
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            Ask about plans
          </Link>
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-spaceship`}
        aria-labelledby={`${baseId}-spaceship`}
        hidden={option !== "spaceship"}
        className="mt-10 sm:mt-12"
      >
        <SpaceshipLogo className="h-7 w-[10.875rem] text-ink sm:h-8 sm:w-[12.4rem]" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-faint">
          Unmanaged · Self-serve · Affiliate
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05] text-ink">
          Run it yourself — Spaceship.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          Unmanaged builds with no maintenance package sit with you. Use{" "}
          <a
            href="https://www.spaceship.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-accent"
          >
            Spaceship
          </a>{" "}
          for domains, hosting and email, or bring your own provider. I&apos;m a
          Spaceship affiliate — same prices for you; I may earn a commission at
          no extra cost.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={site.spaceshipAffiliate}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Visit Spaceship
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            Prefer your own host? Tell me
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {spaceshipPoints.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-3 py-8 sm:py-10 md:grid-cols-12 md:gap-6"
            >
              <span className="text-sm text-faint md:col-span-1">
                0{index + 1}
              </span>
              <h3 className="text-xl text-ink sm:text-2xl md:col-span-4">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted md:col-span-7 md:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-8 border border-line bg-surface px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-12 md:gap-10 md:px-10">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Affiliate disclosure
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.65rem,4vw,2.25rem)] italic leading-[1.05] text-ink">
              Honest about the link
            </h3>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-muted md:col-span-6 md:col-start-7">
            <p>
              Links to Spaceship here are affiliate links. If you purchase
              through them, I may receive a commission. You pay the same price
              either way.
            </p>
            <p className="text-sm md:text-base">
              Prefer to go direct? Visit{" "}
              <a
                href="https://www.spaceship.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-accent"
              >
                spaceship.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-verpex`}
        aria-labelledby={`${baseId}-verpex`}
        hidden={option !== "verpex"}
        className="mt-10 sm:mt-12"
      >
        <VerpexLogo className="h-9 w-[11.5rem] sm:h-10 sm:w-[13rem]" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-faint">
          Unmanaged · Self-serve · Affiliate
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-[clamp(2rem,7vw,3.5rem)] italic leading-[1.05] text-ink">
          Run it yourself — Verpex.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          Prefer classic cPanel hosting with strong UK and global coverage?{" "}
          <a
            href="https://verpex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-accent"
          >
            Verpex
          </a>{" "}
          is another unmanaged option I recommend. I&apos;m a Verpex affiliate —
          same prices for you; I may earn a commission at no extra cost.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={site.verpexAffiliate}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5"
          >
            Visit Verpex
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            Prefer your own host? Tell me
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {verpexPoints.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-3 py-8 sm:py-10 md:grid-cols-12 md:gap-6"
            >
              <span className="text-sm text-faint md:col-span-1">
                0{index + 1}
              </span>
              <h3 className="text-xl text-ink sm:text-2xl md:col-span-4">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted md:col-span-7 md:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-8 border border-line bg-surface px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-12 md:gap-10 md:px-10">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Affiliate disclosure
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.65rem,4vw,2.25rem)] italic leading-[1.05] text-ink">
              Honest about the link
            </h3>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-muted md:col-span-6 md:col-start-7">
            <p>
              Links to Verpex here are affiliate links. If you purchase through
              them, I may receive a commission. You pay the same price either
              way.
            </p>
            <p className="text-sm md:text-base">
              Prefer to go direct? Visit{" "}
              <a
                href="https://verpex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-accent"
              >
                verpex.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
