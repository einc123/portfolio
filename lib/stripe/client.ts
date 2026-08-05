import Stripe from "stripe";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

let stripe: Stripe | null = null;

function assertKeyMatchesEnvironment(key: string) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd && key.startsWith("sk_live_")) {
    throw new Error(
      "Refusing to use a live Stripe secret key outside production. Put sk_test_… in .env.local and keep sk_live_… in Cloudflare production secrets.",
    );
  }
  if (isProd && key.startsWith("sk_test_")) {
    throw new Error(
      "Refusing to use a Stripe test secret key in production. Set STRIPE_SECRET_KEY to sk_live_… in Cloudflare.",
    );
  }
}

export async function getStripe(): Promise<Stripe> {
  if (stripe) return stripe;
  const key = await getRuntimeEnv("STRIPE_SECRET_KEY");
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  assertKeyMatchesEnvironment(key);
  // Workers have no node:https — without FetchHttpClient, Stripe calls hang
  // until they time out (see OpenNext Stripe howto).
  stripe = new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 12_000,
    maxNetworkRetries: 1,
  });
  return stripe;
}

export function stripeErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error) return error.message;
  return "Stripe request failed.";
}
