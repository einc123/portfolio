"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Photo = {
  src: string;
  alt: string;
};

export function PhotographyCarousel({ images }: { images: readonly Photo[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const previous = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previous, next]);

  if (count === 0) return null;

  const current = images[index];

  return (
    <div
      className="photo-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="relative overflow-hidden bg-surface"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start == null || end == null) return;
          const delta = end - start;
          if (Math.abs(delta) < 40) return;
          if (delta > 0) previous();
          else next();
        }}
      >
        <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[16/11]">
          {images.map((image, imageIndex) => (
            <figure
              key={image.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                imageIndex === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={imageIndex !== index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                width={1600}
                height={1200}
                loading={imageIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${
                  imageIndex === index ? "scale-100" : "scale-[1.04]"
                }`}
              />
            </figure>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0e0c]/55 to-transparent" />

        <p className="absolute bottom-4 left-4 right-24 text-sm text-white/90 sm:bottom-5 sm:left-5">
          <span className="tabular-nums text-white/60">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <span className="mt-1 block line-clamp-2 text-[13px] leading-snug text-white/80">
            {current.alt}
          </span>
        </p>

        <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-5 sm:right-5">
          <button
            type="button"
            onClick={previous}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/35 bg-[#0a0e0c]/35 text-white backdrop-blur-sm transition-colors hover:border-white/70"
            aria-label="Previous photograph"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/35 bg-[#0a0e0c]/35 text-white backdrop-blur-sm transition-colors hover:border-white/70"
            aria-label="Next photograph"
          >
            →
          </button>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Photograph slides"
      >
        {images.map((image, imageIndex) => (
          <button
            key={image.src}
            type="button"
            role="tab"
            aria-selected={imageIndex === index}
            aria-label={`Show photograph ${imageIndex + 1}`}
            onClick={() => goTo(imageIndex)}
            className={`h-1.5 transition-all ${
              imageIndex === index
                ? "w-8 bg-accent"
                : "w-3 bg-line hover:bg-faint"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
