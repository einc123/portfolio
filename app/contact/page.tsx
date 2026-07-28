import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/data";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name}, web designer and developer in ${site.location}. Email ${site.email} or book a consultation to talk through your next project.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Euan Livingstone",
    description: `Get in touch with ${site.name} — web designer and developer based in ${site.location}.`,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="page-pad mx-auto w-full max-w-6xl pb-16 pt-6 sm:pt-8 md:pt-12">
      <p className="reveal text-[11px] uppercase tracking-[0.18em] text-faint">
        Contact
      </p>
      <h1 className="reveal reveal-delay-1 mt-4 max-w-3xl font-display text-[clamp(2.75rem,12vw,5.5rem)] italic leading-[0.95] text-ink">
        Say hello.
      </h1>
      <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
        Have a project in mind, or just want to compare notes? Send a message
        or book time directly in my calendar.
      </p>

      <div className="mt-12 grid gap-12 sm:mt-16 md:mt-20 md:grid-cols-12 md:gap-16">
        <div className="space-y-8 md:col-span-5 md:space-y-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Email
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-block break-anywhere text-xl text-ink link-underline sm:text-2xl"
            >
              {site.email}
            </a>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Social
            </p>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-lg text-ink link-underline"
            >
              LinkedIn
            </a>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Location
            </p>
            <p className="mt-3 text-lg text-ink">{site.location}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {site.address.development}
            </p>
          </div>

          <div className="border border-line bg-surface p-5 sm:p-6">
            <p className="text-sm text-muted">
              Prefer to talk live? Book a 30-minute or 1-hour consultation
              straight into Google Calendar.
            </p>
            <Link
              href="/book"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent link-underline"
            >
              Book a chat →
            </Link>
          </div>
        </div>

        <div className="min-w-0 md:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
