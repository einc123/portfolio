"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  beginTotpSetup,
  confirmTotpSetup,
  disableTotp,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function TotpSetupForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(
    null,
  );
  const [beginError, setBeginError] = useState<string | null>(null);
  const [beginPending, startBegin] = useTransition();

  const [confirmState, confirmAction, confirmPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await confirmTotpSetup(prev, formData);
      if (result.ok) {
        setSetup(null);
        router.refresh();
      }
      return result;
    },
    initial,
  );

  const [disableState, disableAction, disablePending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await disableTotp(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initial,
  );

  if (enabled) {
    return (
      <form action={disableAction} className="mt-6 space-y-4 border border-line bg-surface p-5">
        <p className="text-sm text-muted">
          Authenticator 2FA is enabled. Enter a code to turn it off.
        </p>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Authentication code
          </span>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        {disableState.error ? (
          <p className="text-sm text-red-600">{disableState.error}</p>
        ) : null}
        {disableState.ok ? (
          <p className="text-sm text-accent">Two-factor authentication disabled.</p>
        ) : null}
        <button
          type="submit"
          disabled={disablePending}
          className="inline-flex min-h-11 items-center justify-center border border-line px-5 py-2.5 text-sm text-ink disabled:opacity-60"
        >
          {disablePending ? "Disabling…" : "Disable 2FA"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-6 space-y-4 border border-line bg-surface p-5">
      <p className="text-sm text-muted">
        Add an authenticator app for email + password + 2FA sign-in.
      </p>
      {!setup ? (
        <>
          {beginError ? <p className="text-sm text-red-600">{beginError}</p> : null}
          <button
            type="button"
            disabled={beginPending}
            onClick={() => {
              setBeginError(null);
              startBegin(async () => {
                const result = await beginTotpSetup();
                if (!result.ok || !result.secret || !result.uri) {
                  setBeginError(result.error || "Could not start 2FA setup.");
                  return;
                }
                setSetup({ secret: result.secret, uri: result.uri });
              });
            }}
            className="inline-flex min-h-11 items-center justify-center border border-line px-5 py-2.5 text-sm text-ink disabled:opacity-60"
          >
            {beginPending ? "Preparing…" : "Set up authenticator 2FA"}
          </button>
        </>
      ) : (
        <form action={confirmAction} className="space-y-4">
          <p className="text-sm text-muted">
            Add this account in your authenticator app using the secret below,
            then enter a code to confirm.
          </p>
          <p className="break-all font-mono text-xs text-ink">{setup.secret}</p>
          <p className="break-all text-xs text-faint">{setup.uri}</p>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Authentication code
            </span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          {confirmState.error ? (
            <p className="text-sm text-red-600">{confirmState.error}</p>
          ) : null}
          {confirmState.ok ? (
            <p className="text-sm text-accent">Two-factor authentication enabled.</p>
          ) : null}
          <button
            type="submit"
            disabled={confirmPending}
            className="inline-flex min-h-11 items-center justify-center bg-accent px-5 py-2.5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {confirmPending ? "Confirming…" : "Confirm and enable 2FA"}
          </button>
        </form>
      )}
    </div>
  );
}
