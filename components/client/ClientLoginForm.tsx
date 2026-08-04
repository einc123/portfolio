"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import {
  loginWithPassword,
  saveAppearancePreferences,
  verifyLogin2fa,
  type ActionState,
} from "@/app/client/actions";
import {
  applyAccountAppearance,
  readLocalAppearance,
} from "@/lib/appearanceClient";

const initial: ActionState = {};

async function handlePostLoginAppearance(result: ActionState) {
  const hasAccount =
    Boolean(result.preferredTheme) || Boolean(result.preferredAccent);
  if (hasAccount) {
    applyAccountAppearance({
      preferredTheme: result.preferredTheme,
      preferredAccent: result.preferredAccent,
    });
  } else {
    const local = readLocalAppearance();
    if (local.theme || local.accent) {
      await saveAppearancePreferences({
        theme: local.theme,
        accent: local.accent,
      });
    }
  }
}

export function ClientLoginForm({
  initialMode = "password",
}: {
  initialMode?: "password" | "2fa";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "2fa">(initialMode);
  const [email, setEmail] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyPending, startPasskey] = useTransition();

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await loginWithPassword(prev, formData);
      if (result.needs2fa) {
        setMode("2fa");
        return result;
      }
      if (result.ok) {
        await handlePostLoginAppearance(result);
      }
      if (result.needsOrgSelect) {
        router.push("/client/select-org");
        return result;
      }
      if (result.ok) {
        router.push(result.needsBilling ? "/client/profile" : "/client/dashboard");
      }
      return result;
    },
    initial,
  );

  const [twoFaState, twoFaAction, twoFaPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await verifyLogin2fa(prev, formData);
      if (result.ok) {
        await handlePostLoginAppearance(result);
      }
      if (result.needsOrgSelect) {
        router.push("/client/select-org");
        return result;
      }
      if (result.ok) {
        router.push(result.needsBilling ? "/client/profile" : "/client/dashboard");
      }
      return result;
    },
    initial,
  );

  function loginWithPasskey() {
    setPasskeyError(null);
    startPasskey(async () => {
      try {
        const optionsRes = await fetch("/api/client/webauthn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login-options", email }),
        });
        const optionsJson = (await optionsRes.json()) as {
          error?: string;
          options?: Parameters<typeof startAuthentication>[0]["optionsJSON"];
        };
        if (!optionsRes.ok || !optionsJson.options) {
          setPasskeyError(optionsJson.error || "Could not start passkey login.");
          return;
        }

        const assertion = await startAuthentication({
          optionsJSON: optionsJson.options,
        });

        const verifyRes = await fetch("/api/client/webauthn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login-verify",
            email,
            response: assertion,
          }),
        });
        const verifyJson = (await verifyRes.json()) as {
          error?: string;
          redirectTo?: string;
          preferredTheme?: string | null;
          preferredAccent?: string | null;
        };
        if (!verifyRes.ok) {
          setPasskeyError(verifyJson.error || "Passkey login failed.");
          return;
        }
        await handlePostLoginAppearance({
          ok: true,
          preferredTheme: verifyJson.preferredTheme as ActionState["preferredTheme"],
          preferredAccent: verifyJson.preferredAccent,
        });
        router.push(verifyJson.redirectTo || "/client/dashboard");
      } catch (error) {
        setPasskeyError(
          error instanceof Error ? error.message : "Passkey login was cancelled.",
        );
      }
    });
  }

  if (mode === "2fa") {
    return (
      <form action={twoFaAction} className="mt-8 space-y-5">
        <p className="text-sm text-muted">
          Enter the 6-digit code from your authenticator app.
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
            className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        {twoFaState.error ? (
          <p className="text-sm text-red-600">{twoFaState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={twoFaPending}
          className="inline-flex min-h-12 items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent disabled:opacity-60"
        >
          {twoFaPending ? "Checking…" : "Verify and continue"}
        </button>
      </form>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <form action={passwordAction} className="space-y-5">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            autoComplete="current-password"
            required
            className="mt-2 w-full border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </label>
        {passwordState.error ? (
          <p className="text-sm text-red-600">{passwordState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={passwordPending}
          className="inline-flex min-h-12 w-full items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent disabled:opacity-60 sm:w-auto"
        >
          {passwordPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="border-t border-line pt-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Or use a passkey
        </p>
        <p className="mt-2 text-sm text-muted">
          Enter your email above, then continue with a saved passkey.
        </p>
        {passkeyError ? (
          <p className="mt-3 text-sm text-red-600">{passkeyError}</p>
        ) : null}
        <button
          type="button"
          onClick={loginWithPasskey}
          disabled={passkeyPending || !email}
          className="mt-4 inline-flex min-h-12 items-center justify-center border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          {passkeyPending ? "Waiting for passkey…" : "Sign in with passkey"}
        </button>
      </div>
    </div>
  );
}
