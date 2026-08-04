import type { Metadata } from "next";
import { GoogleCalendarBooking } from "@/components/GoogleCalendarBooking";
import { ProcessSteps } from "@/components/ProcessSteps";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Book a chat",
  description:
    "Book a 30-minute or 1-hour consultation with Euan Livingstone MBCS via Google Calendar. Remote-friendly, based in Dunfermline, Scotland.",
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Book a chat — Euan Livingstone",
    description:
      "Pick a consultation length and book directly into the calendar — no back-and-forth.",
    url: "/book",
  },
};

export default function BookPage() {
  return (
    <>
      <div className="page-pad mx-auto w-full max-w-6xl pt-6 sm:pt-8 md:pt-12">
        <p className="reveal text-[11px] uppercase tracking-[0.18em] text-faint">
          Book a chat
        </p>
        <h1 className="reveal reveal-delay-1 mt-4 max-w-3xl font-display text-[clamp(2.5rem,11vw,5.5rem)] italic leading-[0.95] text-ink">
          Pick a time that works.
        </h1>
        <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          Choose a consultation length and book directly into my Google Calendar
          — no back-and-forth. Based in {site.location}, available for remote
          chats.
        </p>

        <div className="reveal reveal-delay-3 mt-10 min-w-0 sm:mt-12 md:mt-16">
          <GoogleCalendarBooking />
        </div>
      </div>

      <ProcessSteps
        eyebrow="What to expect"
        heading="How a project unfolds."
        intro="In a consultation I’ll map your goals to a clear process — planning, design, development, changes and launch — so you know exactly what comes next."
        className="page-pad mx-auto w-full max-w-6xl pb-12 pt-12 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20"
      />
    </>
  );
}
