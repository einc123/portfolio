"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { changeForcedPassword, logoutAction, type ActionState } from "@/app/client/actions";

const initial: ActionState = {};

export function ForcePasswordResetModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await changeForcedPassword(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initial,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-password-title"
    >
      <div className="absolute inset-0 bg-[#050807]/72" aria-hidden />
      <div className="relative z-[1] flex max-h-[min(92svh,36rem)] w-full max-w-lg flex-col overflow-hidden border border-line bg-background sm:mx-4">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-faint">
            Required
          </p>
          <h2
            id="force-password-title"
            className="mt-2 font-display text-[clamp(1.75rem,6vw,2.5rem)] italic leading-[1.05] text-ink"
          >
            Set a new password.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Your account was created with a temporary password. Choose a new one
            before continuing.
          </p>
        </div>
        <form action={action} className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              New password
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Confirm password
            </span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          {state.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save password & continue"}
          </button>
        </form>
        <div className="border-t border-line px-5 py-4 sm:px-6">
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted underline-offset-2 hover:underline">
              Sign out instead
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
