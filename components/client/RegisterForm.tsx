"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { completeRegistration, type ActionState } from "@/app/client/actions";

const initial: ActionState = {};

export function RegisterForm({
  token,
  email,
  organisationName,
}: {
  token: string;
  email: string;
  organisationName: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await completeRegistration(prev, formData);
      if (result.ok) router.push("/client/select-org");
      return result;
    },
    initial,
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />

      <p className="text-sm text-muted">
        Invited as <span className="text-ink">{email}</span>
      </p>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Your name
        </span>
        <input
          name="fullName"
          required
          className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Organisation name
        </span>
        <input
          name="organisationName"
          required
          defaultValue={organisationName}
          className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
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
          autoComplete="new-password"
          required
          className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="orgConfirmed"
          className="mt-1 accent-[var(--accent)]"
          required
        />
        <span>I confirm the organisation details above are correct.</span>
      </label>

      <p className="text-sm text-muted">
        After creating your account you&apos;ll add billing details on your
        profile before the dashboard unlocks.
      </p>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create account and continue"}
      </button>
    </form>
  );
}
