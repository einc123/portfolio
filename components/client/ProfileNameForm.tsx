"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { updateProfileName, type ActionState } from "@/app/client/actions";

const initial: ActionState = {};

export function ProfileNameForm({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await updateProfileName(prev, formData);
      if (result.ok) router.refresh();
      return result;
    },
    initial,
  );

  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Display name
        </span>
        <input
          name="fullName"
          required
          defaultValue={fullName}
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-accent">Name updated.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-accent px-6 py-2.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
