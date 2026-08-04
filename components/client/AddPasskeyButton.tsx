"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useState, useTransition } from "react";

export function AddPasskeyButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function addPasskey() {
    setMessage(null);
    setError(null);
    start(async () => {
      try {
        const optionsRes = await fetch("/api/client/webauthn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "register-options" }),
        });
        const optionsJson = (await optionsRes.json()) as {
          error?: string;
          options?: Parameters<typeof startRegistration>[0]["optionsJSON"];
        };
        if (!optionsRes.ok || !optionsJson.options) {
          setError(optionsJson.error || "Could not start passkey setup.");
          return;
        }

        const attestation = await startRegistration({
          optionsJSON: optionsJson.options,
        });

        const verifyRes = await fetch("/api/client/webauthn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register-verify",
            response: attestation,
          }),
        });
        const verifyJson = (await verifyRes.json()) as { error?: string };
        if (!verifyRes.ok) {
          setError(verifyJson.error || "Could not save passkey.");
          return;
        }
        setMessage("Passkey saved. You can use it next time you sign in.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Passkey setup was cancelled.",
        );
      }
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={addPasskey}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center border border-line bg-surface px-5 py-2.5 text-sm text-ink disabled:opacity-60"
      >
        {pending ? "Waiting for passkey…" : "Add a passkey to this account"}
      </button>
      {message ? <p className="mt-3 text-sm text-accent">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
