"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-pad mx-auto flex min-h-[50vh] w-full max-w-6xl flex-col justify-center pb-16 pt-10">
      <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Error</p>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,8vw,4rem)] italic leading-[0.95] text-ink">
        Something went wrong.
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
        This page hit an unexpected error. You can try again or head back home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
