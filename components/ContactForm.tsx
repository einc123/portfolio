"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus("error");
        setError(payload?.error || "Could not send your message.");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Could not send your message. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-line bg-surface p-5 sm:p-6 md:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
            Name
          </span>
          <input
            name="name"
            required
            autoComplete="name"
            disabled={status === "sending"}
            className="mt-2 w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors focus:border-accent disabled:opacity-60"
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
            autoComplete="email"
            disabled={status === "sending"}
            className="mt-2 w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors focus:border-accent disabled:opacity-60"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={6}
          disabled={status === "sending"}
          className="mt-2 w-full resize-y border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors focus:border-accent disabled:opacity-60"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 w-full items-center justify-center bg-accent px-7 py-3.5 text-sm font-medium text-on-accent transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" ? (
          <p className="text-sm text-muted">Thanks — your message is on its way.</p>
        ) : status === "error" ? (
          <p className="text-sm text-muted">{error}</p>
        ) : (
          <p className="text-sm text-faint">Delivered to hello@euanliv.click</p>
        )}
      </div>
    </form>
  );
}
