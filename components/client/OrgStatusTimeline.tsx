import Link from "next/link";
import {
  orgProjectStatusIndex,
  parseOrgProjectStatus,
  processSteps,
  type OrgProjectStatus,
} from "@/lib/data";

export function OrgStatusTimeline({
  status,
  variant = "full",
  showViewLink = false,
}: {
  status: OrgProjectStatus | string | null | undefined;
  variant?: "full" | "compact";
  showViewLink?: boolean;
}) {
  const current = parseOrgProjectStatus(status);
  const currentIndex = orgProjectStatusIndex(current);
  const currentStep = processSteps[currentIndex] ?? processSteps[0];

  if (variant === "compact") {
    return (
      <section className="border border-line bg-surface px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Organisation status
            </h2>
            <p className="mt-3 font-display text-2xl italic text-ink sm:text-3xl">
              {String(currentIndex + 1).padStart(2, "0")} · {currentStep.title}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {currentStep.description}
            </p>
          </div>
          {showViewLink ? (
            <Link
              href="/client/status"
              className="inline-flex min-h-10 items-center border border-line px-4 text-sm text-ink transition-colors hover:border-accent/40"
            >
              View status
            </Link>
          ) : null}
        </div>

        <ol className="mt-6 flex gap-1.5" aria-label="Project progress">
          {processSteps.map((step, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li
                key={step.id}
                className={`h-1.5 flex-1 ${
                  done || active ? "bg-accent" : "bg-line"
                }`}
                title={`${String(index + 1).padStart(2, "0")} ${step.title}`}
              >
                <span className="sr-only">
                  {step.title}
                  {active ? " (current)" : done ? " (complete)" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section className="border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-faint">
        Organisation status
      </h2>
      <p className="mt-3 font-display text-[clamp(1.75rem,5vw,2.5rem)] italic leading-tight text-ink">
        Currently in {currentStep.title.toLowerCase()}.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        {currentStep.description}
      </p>

      <ol className="mt-8 divide-y divide-line border-t border-line">
        {processSteps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step.id}
              className={`grid gap-2 py-6 sm:grid-cols-12 sm:items-baseline sm:gap-6 ${
                active ? "" : done ? "opacity-70" : "opacity-45"
              }`}
            >
              <span
                className={`text-sm md:col-span-1 ${
                  active ? "text-accent" : "text-faint"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="sm:col-span-3">
                <h3
                  className={`font-display text-2xl italic sm:text-3xl ${
                    active ? "text-ink" : "text-muted"
                  }`}
                >
                  {step.title}
                </h3>
                {active ? (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-accent">
                    Current
                  </p>
                ) : done ? (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-faint">
                    Complete
                  </p>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed text-muted sm:col-span-8 sm:text-base">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
