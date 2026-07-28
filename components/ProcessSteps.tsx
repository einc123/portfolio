import { processSteps } from "@/lib/data";

export function ProcessSteps({
  eyebrow = "Process",
  heading = "Steps to a successful website.",
  intro = "A clear path from first conversation to launch — so every project stays focused, collaborative and on track.",
  className = "page-pad mx-auto w-full max-w-6xl py-16 sm:py-20 md:py-28",
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05] text-ink">
          {heading}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted sm:mt-6 md:text-lg">
          {intro}
        </p>
      </div>

      <ol className="mt-10 divide-y divide-line border-y border-line sm:mt-12 md:mt-14">
        {processSteps.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-3 py-7 sm:gap-4 sm:py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-9"
          >
            <span className="text-sm text-accent md:col-span-1">
              0{index + 1}
            </span>
            <h3 className="font-display text-2xl italic text-ink sm:text-3xl md:col-span-3">
              {step.title}
            </h3>
            <p className="text-base leading-relaxed text-muted md:col-span-8 md:text-lg">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
