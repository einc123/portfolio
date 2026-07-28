import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProcessSteps } from "@/components/ProcessSteps";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected web design and development case studies by Euan Livingstone MBCS — brand, UI/UX and full-stack builds for clients across Scotland and beyond.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Work — Euan Livingstone",
    description:
      "Case studies spanning brand design, UI/UX and production web development.",
    url: "/work",
  },
};

export default function WorkPage() {
  return (
    <>
      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
          ]}
          className="mb-8"
        />
        <p className="reveal text-[11px] uppercase tracking-[0.18em] text-faint">
          19 — 26
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 font-display text-[clamp(2.75rem,12vw,5.5rem)] italic leading-[0.95] text-ink">
          Past work.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          Case studies spanning brand design, UI/UX and full web development —
          each project designed in Figma with assets in Adobe Illustrator and
          Photoshop. Based in Dunfermline with{" "}
          <Link href="/dunfermline" className="link-underline text-accent">
            local Fife work
          </Link>{" "}
          and remote UK clients.
        </p>

        <section className="mt-12 sm:mt-16 md:mt-24">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Case studies
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line sm:mt-8">
            {projects.map((project, index) => (
              <li key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 py-7 sm:gap-x-6 sm:py-8 md:grid-cols-12 md:items-center md:gap-8 md:py-10"
                >
                  <span className="self-center text-sm text-faint md:col-span-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={`flex h-16 items-center justify-center border border-line px-3 sm:h-20 sm:px-4 md:col-span-2 ${
                      project.logoLight ? "bg-[#e4e8e6]" : "bg-[#2c322f]"
                    }`}
                  >
                    <Image
                      src={project.logo}
                      alt=""
                      width={120}
                      height={64}
                      className="h-10 w-auto max-w-full object-contain sm:h-12"
                    />
                  </div>

                  <div className="col-span-2 min-w-0 md:col-span-5">
                    <h2 className="text-[1.35rem] leading-tight text-ink transition-colors group-hover:text-accent sm:text-2xl md:text-3xl">
                      {project.title}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted md:text-base">
                      {project.summary}
                    </p>
                  </div>

                  <div className="col-span-2 flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
                    <p className="text-sm text-muted">
                      {project.services.join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-1.5 md:justify-end">
                      {project.stack.slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="border border-line px-2 py-0.5 text-[11px] text-faint"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-accent">View case study →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ProcessSteps
        intro="Every case study follows the same disciplined path — from planning through design, build, refinement and launch."
      />

      <section className="page-pad mx-auto w-full max-w-6xl border-t border-line pb-16 pt-12 sm:pt-14">
        <h2 className="font-display text-[clamp(1.85rem,7vw,2.75rem)] italic leading-[1.05] text-ink">
          Let&apos;s talk about your next project.
        </h2>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/book"
            className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent"
          >
            Book a chat
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
          >
            Contact
          </Link>
        </div>
      </section>
    </>
  );
}
