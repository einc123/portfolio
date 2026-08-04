"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  completePasswordReset,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await completePasswordReset(prev, formData);
      if (result.ok) router.push("/client/login");
      return result;
    },
    initial,
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />
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
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-accent">Password updated. Redirecting to login…</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
