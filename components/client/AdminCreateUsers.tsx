"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateOrganisation,
  adminCreateUser,
  adminInviteClient,
  type ActionState,
} from "@/app/client/actions";

const initial: ActionState = {};

type OrgOption = { id: number; name: string };

function useRefreshOnSuccess(state: ActionState) {
  const router = useRouter();
  const lastOk = useRef(false);
  useEffect(() => {
    if (state.ok && !lastOk.current) router.refresh();
    lastOk.current = Boolean(state.ok);
  }, [state.ok, router]);
}

function Feedback({ state }: { state: ActionState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-accent">Done.</p>;
  return null;
}

export function AdminCreateUsers({
  organisations,
}: {
  organisations: OrgOption[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-2xl italic text-ink">Invite user</h2>
        <p className="mt-2 text-sm text-muted">
          Emails a registration link. Assign them to an existing organisation as
          a member or owner, or create a new organisation for them. A Stripe
          customer is created on invite unless you paste an existing customer
          id.
        </p>
        <InviteForm organisations={organisations} />
      </section>

      <section className="border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-display text-2xl italic text-ink">Create user</h2>
        <p className="mt-2 text-sm text-muted">
          Creates an active account with a temporary password. They must reset
          it on first login.
        </p>
        <CreateForm organisations={organisations} />
      </section>

      <section className="border border-line bg-surface p-5 sm:p-6 lg:col-span-2">
        <h2 className="font-display text-2xl italic text-ink">
          Create organisation
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Add an organisation on its own, then assign people from People or
          Organisation explorer.
        </p>
        <CreateOrganisationForm />
      </section>
    </div>
  );
}

function InviteForm({ organisations }: { organisations: OrgOption[] }) {
  const [state, action, pending] = useActionState(adminInviteClient, initial);
  const [orgMode, setOrgMode] = useState<"existing" | "new">(
    organisations.length > 0 ? "existing" : "new",
  );
  useRefreshOnSuccess(state);

  return (
    <form action={action} className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            First name
          </span>
          <input
            name="firstName"
            required
            autoComplete="given-name"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Last name
          </span>
          <input
            name="lastName"
            required
            autoComplete="family-name"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Organisation
        </legend>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="orgModeRadio"
            checked={orgMode === "existing"}
            disabled={organisations.length === 0}
            onChange={() => setOrgMode("existing")}
          />
          Assign to existing
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="orgModeRadio"
            checked={orgMode === "new"}
            onChange={() => setOrgMode("new")}
          />
          Create new organisation
        </label>
      </fieldset>

      {orgMode === "existing" ? (
        <>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Existing organisation
            </span>
            <select
              name="organisationId"
              required
              defaultValue=""
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            >
              <option value="" disabled>
                Choose organisation
              </option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Role
            </span>
            <select
              name="role"
              defaultValue="member"
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
          </label>
        </>
      ) : (
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            New organisation name
          </span>
          <input
            name="organisationName"
            required
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
          <span className="mt-1 block text-xs text-faint">
            They’ll be added as the organisation owner.
          </span>
        </label>
      )}

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Stripe customer id{" "}
          <span className="normal-case tracking-normal text-faint/80">
            (optional)
          </span>
        </span>
        <input
          name="stripeCustomerId"
          placeholder="cus_… — leave blank to create one"
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
        <span className="mt-1 block text-xs text-faint">
          Paste an existing Stripe customer id if they already have one.
          Otherwise a new customer is created when you send the invite.
        </span>
      </label>

      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}

function CreateForm({ organisations }: { organisations: OrgOption[] }) {
  const [state, action, pending] = useActionState(adminCreateUser, initial);
  const [stripeMode, setStripeMode] = useState<"none" | "create" | "assign">(
    "none",
  );
  const [organisationId, setOrganisationId] = useState("");
  useRefreshOnSuccess(state);

  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Full name
        </span>
        <input
          name="fullName"
          required
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Temporary password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={10}
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Existing organisation
        </span>
        <select
          name="organisationId"
          value={organisationId}
          onChange={(event) => setOrganisationId(event.target.value)}
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        >
          <option value="">None — or create below</option>
          {organisations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>
      {organisationId ? (
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Role
          </span>
          <select
            name="role"
            defaultValue="member"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Or new organisation name
          </span>
          <input
            name="organisationName"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
      )}
      <fieldset className="space-y-2">
        <legend className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Stripe customer
        </legend>
        <input type="hidden" name="stripeMode" value={stripeMode} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="stripeModeRadio"
            checked={stripeMode === "none"}
            onChange={() => setStripeMode("none")}
          />
          None for now
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="stripeModeRadio"
            checked={stripeMode === "create"}
            onChange={() => setStripeMode("create")}
          />
          Create new Stripe customer
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="radio"
            name="stripeModeRadio"
            checked={stripeMode === "assign"}
            onChange={() => setStripeMode("assign")}
          />
          Assign existing Stripe customer
        </label>
        {stripeMode === "assign" ? (
          <input
            name="stripeCustomerId"
            required
            placeholder="cus_…"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        ) : null}
      </fieldset>
      <label className="flex items-center gap-2">
        <input name="isAdmin" type="checkbox" className="h-4 w-4" />
        <span className="text-sm text-muted">Make this user an admin</span>
      </label>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}

function CreateOrganisationForm() {
  const [state, action, pending] = useActionState(
    adminCreateOrganisation,
    initial,
  );
  useRefreshOnSuccess(state);

  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Organisation name
        </span>
        <input
          name="name"
          required
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Description (optional)
        </span>
        <textarea
          name="description"
          rows={3}
          placeholder="Shown on the organisation picker"
          className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
        />
      </label>
      <div className="sm:col-span-2 space-y-3">
        <Feedback state={state} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create organisation"}
        </button>
      </div>
    </form>
  );
}
