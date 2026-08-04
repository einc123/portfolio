import Link from "next/link";
import { photographyImages } from "@/lib/photography";

export function PhotographyPromo({
  className = "py-16 sm:py-20 md:py-28",
}: {
  className?: string;
}) {
  const rail = [...photographyImages, ...photographyImages];

  return (
    <section className={className} aria-labelledby="photography-promo-heading">
      <div className="page-pad mx-auto w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
              Photography
            </p>
            <h2
              id="photography-promo-heading"
              className="mt-3 font-display text-[clamp(2.25rem,8vw,3.75rem)] italic leading-[1.05] text-ink"
            >
              A practice in stills and sky.
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-base leading-relaxed text-muted md:text-lg">
              Dedicated photography and licensed drone work — architecture,
              locations, events, and aerial views. Fujifilm X-M5 and DJI Mini 3,
              with public liability insurance. Subject to travel costs and
              location.
            </p>
            <Link
              href="/photography"
              className="mt-5 inline-flex min-h-11 items-center text-sm text-accent link-underline"
            >
              Explore photography →
            </Link>
          </div>
        </div>
      </div>

      <div className="photo-rail mt-10 sm:mt-12 md:mt-14">
        <div className="photo-rail__fade photo-rail__fade--left" aria-hidden />
        <div className="photo-rail__fade photo-rail__fade--right" aria-hidden />
        <div className="photo-rail__track">
          {rail.map((image, index) => (
            <Link
              key={`${image.src}-${index}`}
              href="/photography"
              className="photo-rail__frame"
              tabIndex={index >= photographyImages.length ? -1 : undefined}
              aria-hidden={index >= photographyImages.length ? true : undefined}
              aria-label={
                index < photographyImages.length
                  ? `View photography — ${image.alt}`
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={index < photographyImages.length ? image.alt : ""}
                width={900}
                height={1200}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                className="photo-rail__image"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
