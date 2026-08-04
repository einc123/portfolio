import { createHash, randomBytes } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { getOrganisationMembership } from "@/lib/auth/users";

const COOKIE_NAME = "client_session";
const CHALLENGE_COOKIE = "webauthn_challenge";

export type ClientSession = {
  userId: number;
  email: string;
  name: string;
  isAdmin: boolean;
  organisationId?: number;
  organisationName?: string;
  /** Password OK, waiting for TOTP */
  pending2fa?: boolean;
  /** Auth OK, waiting for organisation pick */
  pendingOrgSelect?: boolean;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a long random string (32+ chars).");
  }
  return createHash("sha256").update(secret).digest();
}

function isImmutableCookiesError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Cookies can only be modified in a Server Action or Route Handler/i.test(
    message,
  );
}

export async function sealSession(payload: ClientSession, maxAgeSec = 60 * 60 * 12) {
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .encrypt(secretKey());
}

export async function readSession(): Promise<ClientSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtDecrypt(token, secretKey());
    if (typeof payload.userId !== "number" || typeof payload.email !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      isAdmin: Boolean(payload.isAdmin),
      organisationId:
        typeof payload.organisationId === "number"
          ? payload.organisationId
          : undefined,
      organisationName:
        typeof payload.organisationName === "string"
          ? payload.organisationName
          : undefined,
      pending2fa: Boolean(payload.pending2fa),
      pendingOrgSelect: Boolean(payload.pendingOrgSelect),
    };
  } catch {
    return null;
  }
}

export async function setSession(payload: ClientSession, maxAgeSec = 60 * 60 * 12) {
  const jar = await cookies();
  const token = await sealSession(payload, maxAgeSec);
  try {
    jar.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSec,
    });
  } catch (error) {
    // RSC page renders cannot mutate cookies — callers in actions/routes must not hit this.
    if (isImmutableCookiesError(error)) return;
    throw error;
  }
}

export async function clearSession() {
  const jar = await cookies();
  try {
    jar.delete(COOKIE_NAME);
  } catch (error) {
    if (isImmutableCookiesError(error)) return;
    throw error;
  }
}

export async function setWebAuthnChallenge(challenge: string) {
  const jar = await cookies();
  jar.set(CHALLENGE_COOKIE, challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 5,
  });
}

export async function takeWebAuthnChallenge() {
  const jar = await cookies();
  const challenge = jar.get(CHALLENGE_COOKIE)?.value ?? null;
  try {
    jar.delete(CHALLENGE_COOKIE);
  } catch (error) {
    if (!isImmutableCookiesError(error)) throw error;
  }
  return challenge;
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function requireActiveDashboard(session: ClientSession | null) {
  if (
    !session ||
    session.pending2fa ||
    session.pendingOrgSelect ||
    !session.organisationId
  ) {
    return null;
  }
  return session;
}

/** Signed in with an organisation selected — profile/billing allowed without billing details. */
export function requireSignedInClient(session: ClientSession | null) {
  return requireActiveDashboard(session);
}

/**
 * Ensures the session organisation still belongs to this user.
 * Returns null when membership is gone.
 *
 * Read-only: never writes cookies (safe to call from RSC pages).
 */
export async function requireOrganisationMembership(
  session: ClientSession | null,
): Promise<ClientSession | null> {
  const active = requireActiveDashboard(session);
  if (!active?.organisationId) return null;

  const membership = await getOrganisationMembership(
    active.userId,
    active.organisationId,
  );

  if (!membership) return null;

  return {
    ...active,
    organisationId: Number(membership.id),
    organisationName: membership.name,
    pending2fa: undefined,
    pendingOrgSelect: undefined,
  };
}
