"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectOrganisation } from "@/app/client/actions";

export function OrgSelectForm({
  organisations,
  currentOrganisationId,
}: {
  organisations: {
    id: number;
    name: string;
    description?: string | null;
    role?: "member" | "owner";
  }[];
  currentOrganisationId?: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function choose(organisationId: number) {
    setError(null);
    setPendingId(organisationId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("organisationId", String(organisationId));
      const result = await selectOrganisation({}, formData);
      if (!result.ok) {
        setError(result.error || "Could not open that organisation.");
        setPendingId(null);
        return;
      }
      // Navigate first so a slow refresh of this page cannot stall the transition.
      router.push(result.needsBilling ? "/client/profile" : "/client/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
        Choose a workspace
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organisations.map((org) => {
          const active = currentOrganisationId === org.id;
          const loading = pending && pendingId === org.id;

          return (
            <button
              key={org.id}
              type="button"
              disabled={pending}
              onClick={() => choose(org.id)}
              className={`group flex min-h-[11rem] flex-col items-start border px-5 py-5 text-left transition-[border-color,transform,background-color] duration-200 disabled:opacity-60 ${
                active
                  ? "border-accent bg-accent-soft/40"
                  : "border-line bg-surface hover:-translate-y-0.5 hover:border-accent/50"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center border text-sm font-semibold tracking-wide ${
                  active
                    ? "border-accent/40 bg-background text-accent"
                    : "border-line bg-background text-ink group-hover:border-accent/40 group-hover:text-accent"
                }`}
                aria-hidden
              >
                {loading ? (
                  <span className="h-4 w-4 animate-pulse rounded-full bg-faint/60" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path
                      d="M4 20V8.5L12 4l8 4.5V20"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 20v-6h6v6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 10.5h.01M15 10.5h.01M12 10.5h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>

              <span className="mt-4 font-display text-2xl italic leading-tight text-ink">
                {org.name}
              </span>

              {org.description?.trim() ? (
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                  {org.description.trim()}
                </span>
              ) : null}

              {active ? (
                <span className="mt-auto pt-4 text-[11px] uppercase tracking-[0.14em] text-accent">
                  Current
                </span>
              ) : (
                <span className="mt-auto pt-4 text-[11px] uppercase tracking-[0.14em] text-faint opacity-0 transition-opacity group-hover:opacity-100">
                  {loading ? "Opening…" : "Open"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
