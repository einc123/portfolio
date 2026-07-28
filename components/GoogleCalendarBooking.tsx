"use client";

import { useState } from "react";
import { bookingOptions } from "@/lib/data";

type BookingId = (typeof bookingOptions)[number]["id"];

export function GoogleCalendarBooking({
  initialId = "30min",
}: {
  initialId?: BookingId;
}) {
  const [activeId, setActiveId] = useState<BookingId>(initialId);
  const active = bookingOptions.find((option) => option.id === activeId)!;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        {bookingOptions.map((option) => {
          const selected = option.id === activeId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveId(option.id)}
              className={`flex-1 border px-4 py-4 text-left transition-colors sm:px-5 ${
                selected
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface text-foreground hover:border-accent/40"
              }`}
            >
              <span className="block text-[11px] uppercase tracking-[0.16em] opacity-70">
                {option.duration}
              </span>
              <span className="mt-1 block text-sm font-medium md:text-base">
                {option.title}
              </span>
              <span
                className={`mt-2 block text-sm leading-relaxed ${
                  selected ? "text-on-accent/80" : "text-muted"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden border border-line bg-surface shadow-[0_20px_60px_-40px_rgba(15,92,76,0.45)]">
        <div className="flex flex-col gap-2 border-b border-line px-4 py-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between md:px-5">
          <span className="min-w-0 truncate">
            Google Calendar · {active.title}
          </span>
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline shrink-0 text-accent"
          >
            Open in new tab
          </a>
        </div>
        <div className="overflow-x-auto">
          <iframe
            key={active.embedUrl}
            src={active.embedUrl}
            title={`Book ${active.title}`}
            className="h-[min(70vh,640px)] min-h-[520px] w-full min-w-[280px] bg-background sm:h-[720px] sm:min-h-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
