import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export function getWebAuthnConfig() {
  const rpID = process.env.WEBAUTHN_RP_ID?.trim() || "localhost";
  const rpName =
    process.env.WEBAUTHN_RP_NAME?.trim() || "Euan Livingstone Client Portal";
  const origin =
    process.env.WEBAUTHN_ORIGIN?.trim() ||
    (rpID === "localhost" ? "http://localhost:3000" : `https://${rpID}`);

  return { rpID, rpName, origin };
}

export function parseTransports(
  value: string | null,
): AuthenticatorTransportFuture[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as AuthenticatorTransportFuture[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function encodePublicKey(publicKey: Uint8Array) {
  return Buffer.from(publicKey).toString("base64url");
}

export function decodePublicKey(value: string) {
  return new Uint8Array(Buffer.from(value, "base64url"));
}
