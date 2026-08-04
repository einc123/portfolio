import Link from "next/link";

export function HostingPromo({
  className = "page-pad mx-auto w-full max-w-6xl py-10 sm:py-12 md:py-14",
}: {
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="grid gap-8 border border-line bg-surface px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-12 md:gap-10 md:px-12 md:py-14">
        <div className="md:col-span-5">
          <p className="font-brand text-sm font-semibold tracking-tight text-ink sm:text-base">
            {"<! Euan Hosting />"}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-faint">
            Hosting &amp; care
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,6vw,3.25rem)] italic leading-[1.05] text-ink">
            Two clear ways to keep a site online.
          </h2>
        </div>
        <div className="flex flex-col justify-between gap-6 md:col-span-6 md:col-start-7">
          <p className="text-base leading-relaxed text-muted md:text-lg">
            Managed builds run in-house on OVH — with or without a maintenance
            plan. Prefer to run it yourself? Go unmanaged with Spaceship,
            Verpex, or hosting you already have.
          </p>
          <Link
            href="/hosting"
            className="inline-flex min-h-11 w-fit items-center text-sm text-accent link-underline"
          >
            Compare hosting options →
          </Link>
        </div>
      </div>
    </section>
  );
}
