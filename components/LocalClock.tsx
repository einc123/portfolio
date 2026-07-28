"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatNow(date: Date) {
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("day")} ${get("month")} ${get("year")} · ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Live UK local clock for the hero presence line. */
export function LocalClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function tick() {
      setNow(new Date());
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <span className="tabular-nums" aria-hidden>
        — — — · ——:——:——
      </span>
    );
  }

  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {formatNow(now)}
    </time>
  );
}
