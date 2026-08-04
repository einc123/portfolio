"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { saveBillingDetails, type ActionState } from "@/app/client/actions";

const initial: ActionState = {};

export type BillingFormValues = {
  billingName: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
};

export function BillingDetailsForm({
  defaults,
  required,
  onSuccess,
}: {
  defaults: BillingFormValues;
  required?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await saveBillingDetails(prev, formData);
      if (result.ok) {
        onSuccess?.();
        router.refresh();
      }
      return result;
    },
    initial,
  );

  const fieldClass = required
    ? "mt-2 w-full border border-line px-4 py-3 text-ink outline-none focus:border-accent"
    : "mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent";

  return (
    <form action={action} className={required ? "space-y-4" : "mt-5 space-y-4"}>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Billing name
        </span>
        <input
          name="billingName"
          required
          defaultValue={defaults.billingName}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Address line 1
        </span>
        <input
          name="line1"
          required
          defaultValue={defaults.line1}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Address line 2{" "}
          <span className="normal-case tracking-normal text-faint">(optional)</span>
        </span>
        <input
          name="line2"
          defaultValue={defaults.line2}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            City / town
          </span>
          <input
            name="city"
            required
            defaultValue={defaults.city}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Postcode
          </span>
          <input
            name="postcode"
            required
            defaultValue={defaults.postcode}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Country
        </span>
        <input
          name="country"
          required
          defaultValue={defaults.country}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Phone{" "}
          <span className="normal-case tracking-normal text-faint">(optional)</span>
        </span>
        <input
          name="phone"
          type="tel"
          defaultValue={defaults.phone}
          className={fieldClass}
        />
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-accent">Billing details saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center bg-accent px-6 py-2.5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : required
            ? "Save billing and continue"
            : "Update billing details"}
      </button>
    </form>
  );
}
