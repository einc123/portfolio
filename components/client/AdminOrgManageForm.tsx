"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminAddMemberToOrganisation,
  adminRemoveOrganisationFromUser,
  adminUpdateOrganisation,
  type ActionState,
} from "@/app/client/actions";
import { displayInitials } from "@/lib/initials";
import { site } from "@/lib/data";

const initial: ActionState = {};

export type AdminOrgRow = {
  id: number;
  name: string;
  description: string | null;
  hosting_type: "managed" | "unmanaged";
  unmanaged_provider: "verpex" | "spaceship" | "other" | null;
  hosting_url: string | null;
  website_url: string | null;
  members: {
    id: number;
    email: string;
    full_name: string | null;
    role: "member" | "owner";
  }[];
};

type UserOption = { id: number; email: string; full_name: string | null };

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

export function AdminOrgManageForm({
  organisation,
  users,
}: {
  organisation: AdminOrgRow;
  users: UserOption[];
}) {
  const [detailsState, detailsAction, detailsPending] = useActionState(
    adminUpdateOrganisation,
    initial,
  );
  const [addState, addAction, addPending] = useActionState(
    adminAddMemberToOrganisation,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    adminRemoveOrganisationFromUser,
    initial,
  );

  useRefreshOnSuccess(detailsState);
  useRefreshOnSuccess(addState);
  useRefreshOnSuccess(removeState);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [hostingType, setHostingType] = useState<"managed" | "unmanaged">(
    organisation.hosting_type === "managed" ? "managed" : "unmanaged",
  );
  const [unmanagedProvider, setUnmanagedProvider] = useState<
    "verpex" | "spaceship" | "other"
  >(
    organisation.unmanaged_provider === "verpex" ||
      organisation.unmanaged_provider === "spaceship" ||
      organisation.unmanaged_provider === "other"
      ? organisation.unmanaged_provider
      : "spaceship",
  );

  useEffect(() => {
    if (addState.ok) setQuery("");
  }, [addState.ok]);

  const memberIds = useMemo(
    () => new Set(organisation.members.map((member) => member.id)),
    [organisation.members],
  );

  const availableUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return users
      .filter((user) => !memberIds.has(user.id))
      .filter((user) => {
        const label = (user.full_name?.trim() || "").toLowerCase();
        return label.includes(needle) || user.email.toLowerCase().includes(needle);
      })
      .slice(0, 8);
  }, [users, memberIds, query]);

  return (
    <div className="space-y-8 border border-line bg-surface px-5 py-6 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-background text-xs font-semibold text-ink">
          {displayInitials(organisation.name, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">
            {organisation.members.length} member
            {organisation.members.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <form action={detailsAction} className="space-y-4">
        <input type="hidden" name="organisationId" value={organisation.id} />
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Name
          </span>
          <input
            name="name"
            required
            defaultValue={organisation.name}
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Description
          </span>
          <textarea
            name="description"
            rows={4}
            defaultValue={organisation.description ?? ""}
            placeholder="Optional"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Live website
          </span>
          <input
            name="websiteUrl"
            type="url"
            defaultValue={organisation.website_url ?? ""}
            placeholder="https://…"
            className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
          />
          <p className="mt-2 text-sm text-muted">
            Shown on the client dashboard when set. Separate from the hosting
            control-panel link.
          </p>
        </label>
        <fieldset className="space-y-3">
          <legend className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Hosting
          </legend>
          <p className="text-sm text-muted">
            Managed is in-house OVH hosting. Unmanaged is Verpex, Spaceship, or
            another provider.
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="hostingType"
                value="managed"
                checked={hostingType === "managed"}
                onChange={() => setHostingType("managed")}
              />
              Managed
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="hostingType"
                value="unmanaged"
                checked={hostingType === "unmanaged"}
                onChange={() => setHostingType("unmanaged")}
              />
              Unmanaged
            </label>
          </div>

          {hostingType === "unmanaged" ? (
            <div className="space-y-3 border border-line bg-background px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
                Unmanaged provider
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="unmanagedProvider"
                    value="verpex"
                    checked={unmanagedProvider === "verpex"}
                    onChange={() => setUnmanagedProvider("verpex")}
                  />
                  Verpex
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="unmanagedProvider"
                    value="spaceship"
                    checked={unmanagedProvider === "spaceship"}
                    onChange={() => setUnmanagedProvider("spaceship")}
                  />
                  Spaceship
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="unmanagedProvider"
                    value="other"
                    checked={unmanagedProvider === "other"}
                    onChange={() => setUnmanagedProvider("other")}
                  />
                  Other
                </label>
              </div>

              {unmanagedProvider === "verpex" ? (
                <p className="text-sm text-muted">
                  Hosting URL set to your Verpex affiliate link:{" "}
                  <a
                    href={site.verpexAffiliate}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-accent break-all"
                  >
                    {site.verpexAffiliate}
                  </a>
                </p>
              ) : null}

              {unmanagedProvider === "spaceship" ? (
                <p className="text-sm text-muted">
                  Hosting URL set to your Spaceship vanity link:{" "}
                  <a
                    href={site.spaceshipAffiliate}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline text-accent break-all"
                  >
                    {site.spaceshipAffiliate}
                  </a>
                </p>
              ) : null}

              {unmanagedProvider === "other" ? (
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
                    Hosting URL
                  </span>
                  <input
                    name="hostingUrlOther"
                    type="url"
                    required
                    defaultValue={
                      organisation.unmanaged_provider === "other"
                        ? (organisation.hosting_url ?? "")
                        : ""
                    }
                    placeholder="https://…"
                    className="mt-2 w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
                  />
                </label>
              ) : null}
            </div>
          ) : null}
        </fieldset>
        <div className="space-y-3">
          <Feedback state={detailsState} />
          <button
            type="submit"
            disabled={detailsPending}
            className="inline-flex min-h-11 items-center bg-accent px-5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {detailsPending ? "Saving…" : "Save organisation"}
          </button>
        </div>
      </form>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-xl italic text-ink">Members</h2>
        <ul className="mt-3 space-y-2">
          {organisation.members.length === 0 ? (
            <li className="text-sm text-muted">None linked.</li>
          ) : (
            organisation.members.map((member) => {
              const label = member.full_name?.trim() || member.email;
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 text-sm text-ink"
                >
                  <span className="min-w-0 truncate">
                    {label}{" "}
                    <span className="text-faint">
                      · {member.email} ({member.role})
                    </span>
                  </span>
                  <form action={removeAction}>
                    <input type="hidden" name="userId" value={member.id} />
                    <input
                      type="hidden"
                      name="organisationId"
                      value={organisation.id}
                    />
                    <button
                      type="submit"
                      disabled={removePending}
                      className="text-muted underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              );
            })
          )}
        </ul>
        <Feedback state={removeState} />

        <div className="mt-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Add member
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="radio"
                name="add-role"
                checked={role === "member"}
                onChange={() => setRole("member")}
              />
              Member
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-muted">
              <input
                type="radio"
                name="add-role"
                checked={role === "owner"}
                onChange={() => setRole("owner")}
              />
              Owner
            </label>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people by name or email…"
            className="w-full border border-line bg-background px-4 py-3 text-ink outline-none focus:border-accent"
            autoComplete="off"
          />
          {availableUsers.length === 0 ? (
            <p className="text-sm text-muted">
              {query.trim()
                ? "No matching people to add."
                : "Type a name or email to find someone."}
            </p>
          ) : (
            <ul className="divide-y divide-line border border-line bg-background">
              {availableUsers.map((user) => {
                const label = user.full_name?.trim() || user.email;
                return (
                  <li key={user.id}>
                    <form action={addAction}>
                      <input
                        type="hidden"
                        name="organisationId"
                        value={organisation.id}
                      />
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value={role} />
                      <button
                        type="submit"
                        disabled={addPending}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition-colors hover:bg-surface disabled:opacity-60"
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-semibold">
                          {displayInitials(label)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {label}
                          </span>
                          <span className="block truncate text-faint">
                            {user.email}
                          </span>
                        </span>
                        <span className="ml-auto shrink-0 text-accent">
                          Assign
                        </span>
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
          <Feedback state={addState} />
        </div>
      </section>
    </div>
  );
}
