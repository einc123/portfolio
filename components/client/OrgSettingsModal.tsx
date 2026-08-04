"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOwnOrganisationDescription,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

type OrgItem = {
  id: number;
  name: string;
  description?: string | null;
  role?: "member" | "owner";
};

export function OrgSettingsModal({
  organisations,
  isAdmin = false,
}: {
  organisations: OrgItem[];
  isAdmin?: boolean;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const editable = organisations.filter(
    (org) => org.role === "owner" || isAdmin,
  );

  if (editable.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-background/80 px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent/40"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="M6.5 2.5h3l.4 1.4a4.5 4.5 0 0 1 1.1.6l1.4-.5 1.5 1.5-.5 1.4c.2.3.4.7.5 1.1l1.4.4v3l-1.4.4a4.5 4.5 0 0 1-.6 1.1l.5 1.4-1.5 1.5-1.4-.5a4.5 4.5 0 0 1-1.1.6l-.4 1.4h-3l-.4-1.4a4.5 4.5 0 0 1-1.1-.6l-1.4.5-1.5-1.5.5-1.4a4.5 4.5 0 0 1-.6-1.1L2.5 9.5v-3l1.4-.4c.1-.4.3-.8.6-1.1l-.5-1.4L5 2.6l1.4.5c.3-.2.7-.4 1.1-.6L6.5 2.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Settings
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 p-4 sm:items-center"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[min(90svh,40rem)] w-full max-w-lg overflow-y-auto border border-line bg-background shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-background px-5 py-4 sm:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
                  Organisations
                </p>
                <h2 id={titleId} className="mt-1 font-display text-2xl italic text-ink">
                  Settings
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Optional descriptions shown on organisation cards. Leave blank
                  for none.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink transition-colors hover:border-accent/40"
                aria-label="Close settings"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {editable.map((org) => (
                <DescriptionForm key={org.id} organisation={org} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DescriptionForm({ organisation }: { organisation: OrgItem }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    updateOwnOrganisationDescription,
    initial,
  );
  const lastOk = useRef(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) router.refresh();
    lastOk.current = Boolean(state.ok);
  }, [state.ok, router]);

  return (
    <form action={action} className="border border-line bg-surface p-4">
      <input type="hidden" name="organisationId" value={organisation.id} />
      <p className="text-sm font-medium text-ink">{organisation.name}</p>
      <textarea
        name="description"
        rows={3}
        defaultValue={organisation.description ?? ""}
        placeholder="Optional description"
        className="mt-3 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
      />
      {state.error ? (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="mt-2 text-sm text-accent">Description saved.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex min-h-10 items-center justify-center border border-line px-4 py-2 text-sm text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save description"}
      </button>
    </form>
  );
}
