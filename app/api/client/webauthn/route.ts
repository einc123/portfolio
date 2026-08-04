import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import {
  decodePublicKey,
  encodePublicKey,
  getWebAuthnConfig,
  parseTransports,
} from "@/lib/auth/webauthn";
import {
  readSession,
  setSession,
  setWebAuthnChallenge,
  takeWebAuthnChallenge,
} from "@/lib/auth/session";
import {
  findPasskeyByCredentialId,
  findUserByEmail,
  findUserById,
  getOrganisationMembership,
  getPasskeysForUser,
  getUserOrganisations,
  savePasskey,
  updatePasskeyCounter,
} from "@/lib/auth/users";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: string;
    email?: string;
    response?: unknown;
  };

  const action = body.action;
  const { rpID, rpName, origin } = getWebAuthnConfig();

  try {
    if (action === "login-options") {
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      if (!email) {
        return NextResponse.json({ error: "Enter your email." }, { status: 400 });
      }

      const user = await findUserByEmail(email);
      if (!user || user.status !== "active") {
        return NextResponse.json(
          { error: "No passkey is available for that account." },
          { status: 404 },
        );
      }

      const passkeys = await getPasskeysForUser(user.id);
      if (passkeys.length === 0) {
        return NextResponse.json(
          { error: "No passkey is registered for this account." },
          { status: 404 },
        );
      }

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: passkeys.map((passkey) => ({
          id: passkey.credential_id,
          transports: parseTransports(passkey.transports),
        })),
        userVerification: "preferred",
      });

      await setWebAuthnChallenge(options.challenge);
      return NextResponse.json({ options, email });
    }

    if (action === "login-verify") {
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      const challenge = await takeWebAuthnChallenge();
      if (!challenge || !body.response || !email) {
        return NextResponse.json(
          { error: "Passkey challenge expired. Try again." },
          { status: 400 },
        );
      }

      const credentialId = String(
        (body.response as { id?: string }).id ?? "",
      );
      const passkey = await findPasskeyByCredentialId(credentialId);
      if (!passkey) {
        return NextResponse.json({ error: "Unknown passkey." }, { status: 400 });
      }

      const user = await findUserById(passkey.user_id);
      if (!user || user.status !== "active" || user.email !== email) {
        return NextResponse.json({ error: "Passkey login failed." }, { status: 400 });
      }

      const verification = await verifyAuthenticationResponse({
        response: body.response as never,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credential_id,
          publicKey: decodePublicKey(passkey.public_key),
          counter: Number(passkey.counter),
          transports: parseTransports(passkey.transports),
        },
      });

      if (!verification.verified) {
        return NextResponse.json({ error: "Passkey could not be verified." }, { status: 400 });
      }

      await updatePasskeyCounter(
        passkey.id,
        verification.authenticationInfo.newCounter,
      );

      const orgs = await getUserOrganisations(user.id);
      if (orgs.length === 0) {
        return NextResponse.json(
          { error: "No organisation is linked to this account." },
          { status: 400 },
        );
      }

      await setSession({
        userId: user.id,
        email: user.email,
        name: user.full_name?.trim() || user.email,
        isAdmin: Boolean(user.is_admin),
        pendingOrgSelect: true,
      });
      return NextResponse.json({
        ok: true,
        redirectTo: "/client/select-org",
        preferredTheme:
          user.preferred_theme === "light" || user.preferred_theme === "dark"
            ? user.preferred_theme
            : null,
        preferredAccent: user.preferred_accent ?? null,
      });
    }

    if (action === "register-options") {
      const session = await readSession();
      if (!session?.organisationId || session.pending2fa || session.pendingOrgSelect) {
        return NextResponse.json({ error: "Sign in required." }, { status: 401 });
      }

      const membership = await getOrganisationMembership(
        session.userId,
        session.organisationId,
      );
      if (!membership) {
        return NextResponse.json(
          { error: "Choose one of your organisations first." },
          { status: 403 },
        );
      }

      const user = await findUserById(session.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const existing = await getPasskeysForUser(user.id);
      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: user.email,
        userDisplayName: user.full_name || user.email,
        excludeCredentials: existing.map((passkey) => ({
          id: passkey.credential_id,
          transports: parseTransports(passkey.transports),
        })),
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      });

      await setWebAuthnChallenge(options.challenge);
      return NextResponse.json({ options });
    }

    if (action === "register-verify") {
      const session = await readSession();
      if (!session?.organisationId || session.pending2fa || session.pendingOrgSelect) {
        return NextResponse.json({ error: "Sign in required." }, { status: 401 });
      }

      const membership = await getOrganisationMembership(
        session.userId,
        session.organisationId,
      );
      if (!membership) {
        return NextResponse.json(
          { error: "Choose one of your organisations first." },
          { status: 403 },
        );
      }

      const challenge = await takeWebAuthnChallenge();
      if (!challenge || !body.response) {
        return NextResponse.json(
          { error: "Passkey challenge expired. Try again." },
          { status: 400 },
        );
      }

      const verification = await verifyRegistrationResponse({
        response: body.response as never,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return NextResponse.json({ error: "Passkey registration failed." }, { status: 400 });
      }

      const { credential, credentialDeviceType, credentialBackedUp } =
        verification.registrationInfo;

      await savePasskey({
        userId: session.userId,
        credentialId: credential.id,
        publicKey: encodePublicKey(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports
          ? JSON.stringify(credential.transports)
          : undefined,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Passkey request failed.",
      },
      { status: 500 },
    );
  }
}
