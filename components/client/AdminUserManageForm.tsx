"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminAddOrganisationToUser,
  adminRemoveOrganisationFromUser,
  adminSendPasswordReset,
  adminUpdateUser,
  adminUpdateUserBilling,
  type ActionState,
} from "@/app/client/actions";
import { AdminUserStripeSection } from "@/components/client/AdminUserStripeSection";
import { displayInitials } from "@/lib/initials";
import type {
  PortalInvoice,
  PortalPayment,
  PortalSubscription,
} from "@/lib/stripe/billing";

const initial: ActionState = {};

export type AdminUserRow = {
  id: number;
  email: string;
  full_name: string | null;
  is_admin: number;
  status: "invited" | "active" | "disabled";
  billing_confirmed: number;
  billing_name: string | null;
  billing_line1: string | null;
  billing_line2: string | null;
  billing_city: string | null;
  billing_postcode: string | null;
  billing_country: string | null;
  billing_phone: string | null;
  stripe_customer_id: string | null;
  organisations: { id: number; name: string; role: "member" | "owner" }[];
};

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
  if (state.ok) return <p className="text-sm text-accent">Saved.</p>;
  return null;
}

export function AdminUserManageForm({
  user,
  organisations,
  stripeBilling,
}: {
  user: AdminUserRow;
  organisations: OrgOption[];
  stripeBilling: {
    invoices: PortalInvoice[];
    payments: PortalPayment[];
    subscriptions: PortalSubscription[];
  } | null;
}) {
  const [editState, editAction, editPending] = useActionState(
    adminUpdateUser,
    initial,
  );
  const [billingState, billingAction, billingPending] = useActionState(
    adminUpdateUserBilling,
    initial,
  );
  const [addState, addAction, addPending] = useActionState(
    adminAddOrganisationToUser,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    adminRemoveOrganisationFromUser,
    initial,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    adminSendPasswordReset,
    initial,
  );

  useRefreshOnSuccess(editState);
  useRefreshOnSuccess(billingState);
  useRefreshOnSuccess(addState);
  useRefreshOnSuccess(removeState);

  const [orgQuery, setOrgQuery] = useState("");
  const [orgRole, setOrgRole] = useState<"member" | "owner">("member");

  useEffect(() => {
    if (addState.ok) setOrgQuery("");
  }, [addState.ok]);

  const linkedIds = useMemo(
    () => new Set(user.organisations.map((org) => org.id)),
    [user.organisations],
  );
  const availableOrgs = useMemo(() => {
    const needle = orgQuery.trim().toLowerCase();
    if (!needle) return [];
    return organisations
      .filter((org) => !linkedIds.has(org.id))
      .filter((org) => org.name.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [organisations, linkedIds, orgQuery]);
  const label = user.full_name?.trim() || user.email;

  return (
    <div className="space-y-8 border border-line bg-surface px-5 py-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-background text-xs font-semibold text-ink">
          {displayInitials(label)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-faint">
            {user.status}
            {user.is_admin ? " · Admin" : ""}
          </p>
        </div>
      </div>

      <form action={editAction} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="userId" value={user.id} />
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Name
          </span>
          <input
            name="fullName"
            defaultValue={user.full_name ?? ""}
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
            defaultValue={user.email}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Status
          </span>
          <select
            name="status"
            defaultValue={user.status}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          >
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-3">
          <input
            name="isAdmin"
            type="checkbox"
            defaultChecked={Boolean(user.is_admin)}
            className="h-4 w-4"
          />
          <span className="text-sm text-muted">Admin access</span>
        </label>
        <div className="space-y-3 sm:col-span-2">
          <Feedback state={editState} />
          <button
            type="submit"
            disabled={editPending}
            className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {editPending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-xl italic text-ink">Organisations</h2>
        <ul className="mt-3 space-y-2">
          {user.organisations.length === 0 ? (
            <li className="text-sm text-muted">None linked.</li>
          ) : (
            user.organisations.map((org) => (
              <li
                key={org.id}
                className="flex items-center justify-between gap-3 text-sm text-ink"
              >
                <span>
                  {org.name} <span className="text-faint">({org.role})</span>
                </span>
                <form action={removeAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="organisationId" value={org.id} />
                  <button
                    type="submit"
                    disabled={removePending}
                    className="text-muted underline-offset-2 hover:underline disabled:opacity-60"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
        <Feedback state={removeState} />

        <div className="mt-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Add organisation
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="radio"
                name="add-org-role"
                checked={orgRole === "member"}
                onChange={() => setOrgRole("member")}
              />
              Member
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="radio"
                name="add-org-role"
                checked={orgRole === "owner"}
                onChange={() => setOrgRole("owner")}
              />
              Owner
            </label>
          </div>
          <input
            type="search"
            value={orgQuery}
            onChange={(event) => setOrgQuery(event.target.value)}
            placeholder="Search organisations…"
            className="w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            autoComplete="off"
          />
          {availableOrgs.length === 0 ? (
            <p className="text-sm text-muted">
              {orgQuery.trim()
                ? "No matching organisations to add."
                : "Type an organisation name to find one."}
            </p>
          ) : (
            <ul className="divide-y divide-line border border-line bg-background">
              {availableOrgs.map((org) => (
                <li key={org.id}>
                  <form action={addAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="mode" value="existing" />
                    <input type="hidden" name="organisationId" value={org.id} />
                    <input type="hidden" name="role" value={orgRole} />
                    <button
                      type="submit"
                      disabled={addPending}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-surface disabled:opacity-60"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-semibold">
                        {displayInitials(org.name, 2)}
                      </span>
                      <span className="min-w-0 truncate font-medium">
                        {org.name}
                      </span>
                      <span className="ml-auto shrink-0 text-accent">
                        Assign
                      </span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <Feedback state={addState} />
        </div>

        <form action={addAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="mode" value="new" />
          <input
            name="organisationName"
            required
            placeholder="Create new organisation"
            className="border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent sm:col-span-1"
          />
          <select
            name="role"
            defaultValue="owner"
            className="border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          >
            <option value="owner">Owner</option>
            <option value="member">Member</option>
          </select>
          <button
            type="submit"
            disabled={addPending}
            className="inline-flex min-h-10 items-center justify-center border border-line px-4 text-sm disabled:opacity-60 sm:col-span-2"
          >
            Create &amp; attach organisation
          </button>
        </form>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-xl italic text-ink">Billing details</h2>
        <p className="mt-2 text-sm text-muted">
          {user.stripe_customer_id
            ? "Saving also updates the linked Stripe customer."
            : "Saved on the portal account. Link a Stripe customer below to sync."}
        </p>
        <form action={billingAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Billing name
            </span>
            <input
              name="billingName"
              defaultValue={user.billing_name ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Address line 1
            </span>
            <input
              name="line1"
              defaultValue={user.billing_line1 ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Address line 2
            </span>
            <input
              name="line2"
              defaultValue={user.billing_line2 ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              City
            </span>
            <input
              name="city"
              defaultValue={user.billing_city ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Postcode
            </span>
            <input
              name="postcode"
              defaultValue={user.billing_postcode ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Country
            </span>
            <input
              name="country"
              defaultValue={user.billing_country ?? "United Kingdom"}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Phone
            </span>
            <input
              name="phone"
              defaultValue={user.billing_phone ?? ""}
              className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </label>
          <div className="space-y-3 sm:col-span-2">
            <Feedback state={billingState} />
            <button
              type="submit"
              disabled={billingPending}
              className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
            >
              {billingPending ? "Saving…" : "Save billing"}
            </button>
          </div>
        </form>
      </section>

      <AdminUserStripeSection
        userId={user.id}
        stripeCustomerId={user.stripe_customer_id}
        organisations={user.organisations.map((org) => ({
          id: org.id,
          name: org.name,
        }))}
        billing={stripeBilling}
      />

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-xl italic text-ink">Password reset</h2>
        <p className="mt-2 text-sm text-muted">
          Email a reset link. They&apos;ll also be required to set a new password
          on next login.
        </p>
        <form action={resetAction} className="mt-4 space-y-3">
          <input type="hidden" name="userId" value={user.id} />
          <Feedback state={resetState} />
          <button
            type="submit"
            disabled={resetPending}
            className="inline-flex min-h-11 items-center border border-line px-5 text-sm disabled:opacity-60"
          >
            {resetPending ? "Sending…" : "Send password reset email"}
          </button>
        </form>
      </section>
    </div>
  );
}
