"use server";

import { redirect } from "next/navigation";
import { hashPassword, isStrongPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSession,
  randomToken,
  readSession,
  setSession,
  type ClientSession,
} from "@/lib/auth/session";
import { verifyTotp, createTotpSecret } from "@/lib/auth/totp";
import {
  addMember,
  clearPasswordResetAndSetPassword,
  completeInviteRegistration,
  createActiveUser,
  createOrganisation,
  findOrganisationById,
  findUserByEmail,
  findUserById,
  findUserByInviteToken,
  findUserByPasswordResetToken,
  getOrganisationMembership,
  getUserOrganisations,
  inviteClientUser,
  listOrganisationMemberStripeCustomerIds,
  removeMember,
  setMustResetPassword,
  setPasswordResetToken,
  setUserAdminFlag,
  setUserTotp,
  updateUserAppearancePreferences,
  updateUserBillingDetails,
  updateUserByAdmin,
  updateUserProfileName,
  updateOrganisationDetails,
  userHasBillingDetails,
} from "@/lib/auth/users";
import {
  assignStripeCustomerToUser,
  assignStripeObjectToOrg,
  cancelOrgSubscription,
  createCustomerSetupIntent,
  createOrgInvoice,
  createOrgSubscription,
  createStripeCustomerForUser,
  ensureStripeCustomerForUser,
  loadAssignedOrgBilling,
  pauseOrgSubscription,
  removeStripeCustomerFromUser,
  resumeOrgSubscription,
  setCustomerDefaultPaymentMethod,
  syncBillingDetailsToStripe,
} from "@/lib/stripe/billing";
import { getStripePublishableKey, stripeErrorMessage } from "@/lib/stripe/client";
import { revalidatePath } from "next/cache";
import { deleteStripeOrgAssignment } from "@/lib/stripe/store";
import {
  deleteCaseStudy,
  upsertCaseStudy,
} from "@/lib/caseStudies";
import { sendClientInviteEmail } from "@/lib/mail/clientInvite";
import { sendBillingPaymentEmail } from "@/lib/mail/billingPayment";
import { sendPasswordResetEmail } from "@/lib/mail/passwordReset";
import { sendSubscriptionCancellationRequestEmail } from "@/lib/mail/cancellationRequest";
import { sendMaintenanceRequestEmail } from "@/lib/mail/maintenanceRequest";
import {
  formatGbpFromPence,
  getHourlyRatePence,
  setHourlyRatePence,
} from "@/lib/settings/store";
import { site } from "@/lib/data";
import { getStripe } from "@/lib/stripe/client";
import {
  buildContractParticularsSection,
  createOrganisationContract,
  deleteOrganisationContract,
  findContractTemplateById,
  findOrganisationContractById,
  listOrganisationOwners,
  renderContractPlaceholders,
  signOrganisationContract,
  templateUsesParticularsPlaceholders,
  updateContractTemplate,
  withdrawOrganisationContract,
} from "@/lib/contracts/store";
import {
  sendContractForSignatureEmail,
  sendSignedContractCopies,
} from "@/lib/mail/contract";
import {
  resolveHostingUrl,
  type UnmanagedProvider,
} from "@/lib/hosting";
import { isAccent } from "@/lib/accent";
import { isTheme } from "@/lib/theme";

export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  needs2fa?: boolean;
  needsOrgSelect?: boolean;
  needsBilling?: boolean;
  preferredTheme?: "light" | "dark" | null;
  preferredAccent?: string | null;
};

function appearanceFromUser(user: {
  preferred_theme?: string | null;
  preferred_accent?: string | null;
}): Pick<ActionState, "preferredTheme" | "preferredAccent"> {
  const theme = user.preferred_theme ?? null;
  const accent = user.preferred_accent ?? null;
  return {
    preferredTheme: isTheme(theme) ? theme : null,
    preferredAccent: isAccent(accent) ? accent : null,
  };
}

async function destinationAfterAuth(userId: number): Promise<{
  needsBilling?: boolean;
}> {
  const user = await findUserById(userId);
  if (!user || !userHasBillingDetails(user)) {
    return { needsBilling: true };
  }
  return {};
}

async function establishAfterAuth(user: {
  id: number;
  email: string;
  full_name: string | null;
  is_admin: number;
  totp_enabled: number;
  preferred_theme?: string | null;
  preferred_accent?: string | null;
}): Promise<ActionState> {
  const full =
    user.preferred_theme !== undefined
      ? user
      : ((await findUserById(user.id)) ?? user);
  const appearance = appearanceFromUser(full);

  const orgs = await getUserOrganisations(user.id);
  const base: ClientSession = {
    userId: user.id,
    email: user.email,
    name: user.full_name?.trim() || user.email,
    isAdmin: Boolean(user.is_admin),
  };

  if (orgs.length === 0) {
    const saved = await setSession(base);
    if (!saved) {
      return {
        error: "Could not start your session. Please try again.",
        ...appearance,
      };
    }
    return {
      ok: true,
      error: "No organisation is linked to this account yet.",
      ...appearance,
    };
  }

  const saved = await setSession({
    ...base,
    pendingOrgSelect: true,
  });
  if (!saved) {
    return {
      error: "Could not start your session. Please try again.",
      ...appearance,
    };
  }
  return { ok: true, needsOrgSelect: true, ...appearance };
}

export async function getMyAppearancePreferences(): Promise<
  ActionState & {
    preferredTheme?: "light" | "dark" | null;
    preferredAccent?: string | null;
  }
> {
  const session = await readSession();
  if (!session?.userId || session.pending2fa) {
    return { ok: false };
  }
  const user = await findUserById(session.userId);
  if (!user) return { ok: false };
  return { ok: true, ...appearanceFromUser(user) };
}

export async function saveAppearancePreferences(input: {
  theme?: string | null;
  accent?: string | null;
}): Promise<ActionState> {
  const session = await readSession();
  if (!session?.userId || session.pending2fa) {
    return { ok: false };
  }

  const themeRaw = input.theme ?? null;
  const accentRaw = input.accent ?? null;
  const theme = isTheme(themeRaw) ? themeRaw : null;
  const accent = isAccent(accentRaw) ? accentRaw : null;
  if (!theme && !accent) return { ok: true };

  try {
    await updateUserAppearancePreferences(session.userId, {
      theme,
      accent,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save appearance preferences.",
    };
  }

  return { ok: true };
}

export async function loginWithPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || user.status !== "active") {
      return { error: "Invalid email or password." };
    }

    if (!user.password_hash) {
      return { error: "Invalid email or password." };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    if (user.totp_enabled && user.totp_secret) {
      await setSession(
        {
          userId: user.id,
          email: user.email,
          name: user.full_name?.trim() || user.email,
          isAdmin: Boolean(user.is_admin),
          pending2fa: true,
        },
        60 * 10,
      );
      return { ok: true, needs2fa: true };
    }

    return await establishAfterAuth(user);
  } catch (error) {
    console.error("loginWithPassword failed", error);
    const message = error instanceof Error ? error.message : String(error);
    if (/AUTH_SECRET/i.test(message)) {
      return {
        error:
          "Sign-in is misconfigured (AUTH_SECRET). Check Worker secrets and try again.",
      };
    }
    if (/no such table|D1_ERROR|D1 query failed/i.test(message)) {
      return {
        error:
          "The client database is not ready yet. Apply D1 migrations, then try again.",
      };
    }
    return { error: "Sign-in failed. Please try again in a moment." };
  }
}

export async function verifyLogin2fa(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await readSession();
  if (!session?.pending2fa) {
    return { error: "Your login session expired. Sign in again." };
  }

  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter your authenticator code." };

  const user = await findUserByEmail(session.email);
  if (!user?.totp_secret || !user.totp_enabled) {
    return { error: "Two-factor authentication is not set up for this account." };
  }

  if (!verifyTotp(user.totp_secret, code)) {
    return { error: "That code isn’t valid. Try again." };
  }

  return establishAfterAuth(user);
}

export async function selectOrganisation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await readSession();
    if (!session || session.pending2fa) {
      return { error: "Please sign in again." };
    }

    const organisationId = Number(formData.get("organisationId"));
    if (!Number.isFinite(organisationId) || organisationId <= 0) {
      return { error: "Choose an organisation." };
    }

    const org = await getOrganisationMembership(session.userId, organisationId);
    if (!org) {
      return { error: "That organisation isn’t available on this account." };
    }

    const saved = await setSession({
      userId: session.userId,
      email: session.email,
      name: session.name,
      isAdmin: session.isAdmin,
      organisationId: Number(org.id),
      organisationName: org.name,
    });
    if (!saved) {
      return {
        error: "Could not save your organisation choice. Please try again.",
      };
    }

    const dest = await destinationAfterAuth(session.userId);
    return { ok: true, ...dest };
  } catch (error) {
    console.error("selectOrganisation failed", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not open that organisation.",
    };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/client/login");
}

export async function adminInviteClient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const user = await findUserById(session.userId);
  if (!user || !userHasBillingDetails(user)) {
    return { error: "Complete your billing details before inviting clients." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const organisationName = String(formData.get("organisationName") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!organisationName || organisationName.length < 2) {
    return { error: "Enter an organisation name." };
  }

  const inviteToken = randomToken(32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72);

  let invited: Awaited<ReturnType<typeof inviteClientUser>>;
  try {
    invited = await inviteClientUser({
      email,
      organisationName,
      inviteToken,
      expiresAt,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not create the invite.",
    };
  }

  const baseUrl = process.env.WEBAUTHN_ORIGIN?.trim() || site.url;
  const inviteUrl = `${baseUrl}/client/register/${inviteToken}`;

  try {
    await sendClientInviteEmail({
      toEmail: invited.user.email,
      organisationName: invited.organisation.name,
      inviteUrl,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Invite created but the email failed to send.",
    };
  }

  return { ok: true };
}

export async function beginTotpSetup(): Promise<
  ActionState & { secret?: string; uri?: string }
> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const setup = createTotpSecret(session.email);
  await setUserTotp(session.userId, setup.secret, false);
  return { ok: true, secret: setup.secret, uri: setup.uri };
}

export async function confirmTotpSetup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter the authenticator code." };

  const user = await findUserByEmail(session.email);
  if (!user?.totp_secret) {
    return { error: "Start 2FA setup first." };
  }

  if (!verifyTotp(user.totp_secret, code)) {
    return { error: "That code isn’t valid. Try again." };
  }

  await setUserTotp(user.id, user.totp_secret, true);
  return { ok: true };
}

export async function disableTotp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const code = String(formData.get("code") ?? "").trim();
  const user = await findUserByEmail(session.email);
  if (!user?.totp_enabled || !user.totp_secret) {
    return { error: "Two-factor authentication is not enabled." };
  }
  if (!verifyTotp(user.totp_secret, code)) {
    return { error: "That code isn’t valid. Try again." };
  }

  await setUserTotp(user.id, null, false);
  return { ok: true };
}

function requireActiveDashboardLike(session: ClientSession | null) {
  return Boolean(
    session?.organisationId &&
      !session.pending2fa &&
      !session.pendingOrgSelect,
  );
}

async function requireMemberSession() {
  const session = await readSession();
  if (!requireActiveDashboardLike(session) || !session?.organisationId) {
    return null;
  }
  const membership = await getOrganisationMembership(
    session.userId,
    session.organisationId,
  );
  if (!membership) return null;
  return session;
}

export async function completeRegistration(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const organisationName = String(formData.get("organisationName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const orgConfirmed = formData.get("orgConfirmed") === "on";

  if (!token) return { error: "Invite link is invalid." };
  if (!fullName || fullName.length < 2) {
    return { error: "Enter your name." };
  }
  if (!organisationName || organisationName.length < 2) {
    return { error: "Confirm the organisation name." };
  }
  if (!isStrongPassword(password)) {
    return {
      error:
        "Password must be at least 10 characters and include a letter and a number.",
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (!orgConfirmed) {
    return { error: "Confirm organisation details before continuing." };
  }

  const user = await findUserByInviteToken(token);
  if (!user) {
    return { error: "This invite has expired or already been used." };
  }

  const orgs = await getUserOrganisations(user.id);
  const organisation = orgs[0];
  if (!organisation) {
    return { error: "No organisation is attached to this invite." };
  }

  const passwordHash = await hashPassword(password);
  await completeInviteRegistration({
    userId: user.id,
    fullName,
    passwordHash,
    organisationId: organisation.id,
    organisationName,
  });

  await setSession({
    userId: user.id,
    email: user.email,
    name: fullName,
    isAdmin: Boolean(user.is_admin),
    pendingOrgSelect: true,
  });

  return { ok: true, needsOrgSelect: true };
}

export async function updateProfileName(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName || fullName.length < 2) {
    return { error: "Enter your name." };
  }
  if (fullName.length > 120) {
    return { error: "That name is too long." };
  }

  await updateUserProfileName(session.userId, fullName);
  await setSession({
    ...session,
    name: fullName,
    pending2fa: undefined,
    pendingOrgSelect: undefined,
  });

  return { ok: true };
}

export async function saveBillingDetails(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const billingName = String(formData.get("billingName") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const line2 = String(formData.get("line2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!billingName || billingName.length < 2) {
    return { error: "Enter the billing name." };
  }
  if (!line1) return { error: "Enter address line 1." };
  if (!city) return { error: "Enter a city or town." };
  if (!postcode) return { error: "Enter a postcode." };
  if (!country) return { error: "Enter a country." };

  await updateUserBillingDetails(session.userId, {
    billingName,
    line1,
    line2,
    city,
    postcode,
    country,
    phone,
  });

  const user = await findUserById(session.userId);
  if (!user) return { error: "Account not found." };

  try {
    await ensureStripeCustomerForUser(user);
    // Re-read so sync uses the linked customer id after create.
    const refreshed = await findUserById(session.userId);
    if (refreshed?.stripe_customer_id) {
      await syncBillingDetailsToStripe(refreshed, {
        billingName,
        line1,
        line2,
        city,
        postcode,
        country,
        phone,
      });
    }
  } catch (error) {
    return {
      error: `Billing saved locally, but Stripe sync failed: ${stripeErrorMessage(error)}`,
    };
  }

  return { ok: true };
}

export async function createPaymentMethodSetupSession(): Promise<
  ActionState & { clientSecret?: string; publishableKey?: string }
> {
  const session = await requireMemberSession();
  if (!session) return { error: "Sign in required." };

  const user = await findUserById(session.userId);
  if (!user || !userHasBillingDetails(user)) {
    return { error: "Save your billing address before adding a card." };
  }

  try {
    const customerId = await ensureStripeCustomerForUser(user);
    const publishableKey = await getStripePublishableKey();
    const setup = await createCustomerSetupIntent(customerId);
    return {
      ok: true,
      clientSecret: setup.clientSecret,
      publishableKey,
    };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function confirmDefaultPaymentMethod(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState & { brand?: string | null; last4?: string | null }> {
  const session = await requireMemberSession();
  if (!session) return { error: "Sign in required." };

  const paymentMethodId = String(formData.get("paymentMethodId") ?? "").trim();
  if (!paymentMethodId.startsWith("pm_")) {
    return { error: "Missing payment method." };
  }

  const user = await findUserById(session.userId);
  if (!user) return { error: "Account not found." };

  try {
    const customerId = await ensureStripeCustomerForUser(user);
    const card = await setCustomerDefaultPaymentMethod(
      customerId,
      paymentMethodId,
    );
    return { ok: true, brand: card.brand, last4: card.last4 };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function requestSubscriptionCancellation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) return { error: "Sign in required." };

  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();
  const subscriptionLabel = String(
    formData.get("subscriptionLabel") ?? "",
  ).trim();
  const amountLabel = String(formData.get("amountLabel") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!subscriptionId.startsWith("sub_")) {
    return { error: "Invalid subscription." };
  }

  const user = await findUserById(session.userId);
  if (!user) return { error: "Account not found." };
  if (!user.stripe_customer_id) {
    return { error: "No Stripe customer is linked to this account." };
  }

  try {
    const stripe = await getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    if (customerId !== user.stripe_customer_id) {
      return { error: "That subscription isn’t on your Stripe account." };
    }

    if (subscription.status === "canceled") {
      return { error: "That subscription is already canceled." };
    }

    await sendSubscriptionCancellationRequestEmail({
      requesterEmail: user.email,
      requesterName: user.full_name,
      organisationName: session.organisationName ?? null,
      subscriptionId,
      subscriptionLabel:
        subscriptionLabel ||
        subscription.metadata?.label ||
        subscriptionId,
      amountLabel: amountLabel || null,
      status: status || subscription.status,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? stripeErrorMessage(error)
          : "Could not send the cancellation request.",
    };
  }

  return {
    ok: true,
    message:
      "Euan Livingstone will be in touch about your cancellation request.",
  };
}

export async function cancelOrgMaintenanceAtPeriodEnd(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session?.organisationId) return { error: "Sign in required." };

  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();
  if (!subscriptionId.startsWith("sub_")) {
    return { error: "Invalid subscription." };
  }

  try {
    const customerIds = await listOrganisationMemberStripeCustomerIds(
      session.organisationId,
    );
    const billing = await loadAssignedOrgBilling(
      session.organisationId,
      customerIds,
    );
    const subscription = billing.subscriptions.find(
      (sub) => sub.id === subscriptionId,
    );
    if (!subscription || subscription.kind !== "maintenance") {
      return {
        error: "That maintenance subscription isn’t on this organisation.",
      };
    }
    if (subscription.status === "canceled") {
      return { error: "That subscription is already canceled." };
    }
    if (subscription.cancelAtPeriodEnd) {
      return { error: "Cancellation is already scheduled for period end." };
    }

    await cancelOrgSubscription(subscriptionId, true);
    revalidatePath("/client/dashboard");
    return {
      ok: true,
      message: "Maintenance will cancel at the end of the current billing period.",
    };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function requestMaintenanceSupport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session?.organisationId) return { error: "Sign in required." };

  const subject = String(formData.get("subject") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();

  if (subject.length < 3) {
    return { error: "Add a short subject for the request." };
  }
  if (details.length < 10) {
    return { error: "Add a bit more detail about what you need." };
  }
  if (subject.length > 160 || details.length > 5000) {
    return { error: "That request is too long." };
  }

  const user = await findUserById(session.userId);
  if (!user) return { error: "Account not found." };

  let hasActiveMaintenance = false;
  let verifiedSubscriptionId: string | null = null;

  try {
    const customerIds = await listOrganisationMemberStripeCustomerIds(
      session.organisationId,
    );
    const billing = await loadAssignedOrgBilling(
      session.organisationId,
      customerIds,
    );
    const activeMaintenance = billing.subscriptions.find(
      (sub) =>
        sub.kind === "maintenance" &&
        ["active", "trialing", "past_due"].includes(sub.status),
    );
    hasActiveMaintenance = Boolean(activeMaintenance);
    if (
      subscriptionId.startsWith("sub_") &&
      activeMaintenance?.id === subscriptionId
    ) {
      verifiedSubscriptionId = subscriptionId;
    } else if (activeMaintenance) {
      verifiedSubscriptionId = activeMaintenance.id;
    }
  } catch {
    // Still allow the request; coverage note falls back to form intent.
    hasActiveMaintenance =
      String(formData.get("hasActiveMaintenance") ?? "") === "1";
    verifiedSubscriptionId = subscriptionId.startsWith("sub_")
      ? subscriptionId
      : null;
  }

  const hourlyRateLabel = formatGbpFromPence(await getHourlyRatePence());

  try {
    await sendMaintenanceRequestEmail({
      requesterEmail: user.email,
      requesterName: user.full_name,
      organisationName: session.organisationName ?? null,
      organisationId: session.organisationId,
      subject,
      details,
      hasActiveMaintenance,
      hourlyRateLabel,
      subscriptionId: verifiedSubscriptionId,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not send the maintenance request.",
    };
  }

  return {
    ok: true,
    message: hasActiveMaintenance
      ? "Request sent. If it falls under your Maintenance Subscription Contract, it will be handled under that plan. Euan Livingstone will be in touch."
      : `Request sent. Without a maintenance subscription, work is charged at ${hourlyRateLabel} per hour. Euan Livingstone will be in touch.`,
  };
}

async function requireAdminSession() {
  const session = await requireMemberSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function adminUpdateUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const status = String(formData.get("status") ?? "active") as
    | "invited"
    | "active"
    | "disabled";
  const isAdmin = formData.get("isAdmin") === "on";

  if (!Number.isFinite(userId)) return { error: "Invalid user." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!["invited", "active", "disabled"].includes(status)) {
    return { error: "Invalid status." };
  }

  const existing = await findUserByEmail(email);
  if (existing && existing.id !== userId) {
    return { error: "That email is already used by another account." };
  }

  if (userId === session.userId && !isAdmin) {
    return { error: "You can’t remove your own admin access." };
  }

  try {
    await updateUserByAdmin({ userId, fullName, email, status, isAdmin });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update user.",
    };
  }

  return { ok: true };
}

export async function adminToggleAdmin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const makeAdmin = formData.get("makeAdmin") === "1";
  if (!Number.isFinite(userId)) return { error: "Invalid user." };
  if (userId === session.userId && !makeAdmin) {
    return { error: "You can’t remove your own admin access." };
  }

  await setUserAdminFlag(userId, makeAdmin);
  return { ok: true };
}

export async function adminAddOrganisationToUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const mode = String(formData.get("mode") ?? "existing");
  const role =
    String(formData.get("role") ?? "member") === "owner" ? "owner" : "member";

  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  try {
    if (mode === "new") {
      const organisationName = String(
        formData.get("organisationName") ?? "",
      ).trim();
      if (organisationName.length < 2) {
        return { error: "Enter an organisation name." };
      }
      const org = await createOrganisation(organisationName);
      await addMember(userId, org.id, role);
    } else {
      const organisationId = Number(formData.get("organisationId"));
      if (!Number.isFinite(organisationId) || organisationId <= 0) {
        return { error: "Choose an organisation." };
      }
      const existing = await findOrganisationById(organisationId);
      if (!existing) {
        return { error: "That organisation doesn’t exist." };
      }
      await addMember(userId, Number(existing.id), role);
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not link the organisation.",
    };
  }

  return { ok: true };
}

export async function adminRemoveOrganisationFromUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const organisationId = Number(formData.get("organisationId"));
  if (!Number.isFinite(userId) || !Number.isFinite(organisationId)) {
    return { error: "Invalid request." };
  }

  await removeMember(userId, organisationId);
  return { ok: true };
}

export async function adminCreateUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const organisationName = String(formData.get("organisationName") ?? "").trim();
  const organisationIdRaw = String(formData.get("organisationId") ?? "").trim();
  const isAdmin = formData.get("isAdmin") === "on";
  const stripeMode = String(formData.get("stripeMode") ?? "none").trim();
  const stripeCustomerId = String(formData.get("stripeCustomerId") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!fullName || fullName.length < 2) {
    return { error: "Enter their name." };
  }
  if (!isStrongPassword(password)) {
    return {
      error:
        "Password must be at least 10 characters and include a letter and a number.",
    };
  }
  if (stripeMode === "assign" && !stripeCustomerId.startsWith("cus_")) {
    return { error: "Enter a Stripe customer id (cus_…) to assign." };
  }

  const existing = await findUserByEmail(email);
  if (existing) return { error: "That email already has an account." };

  try {
    const passwordHash = await hashPassword(password);
    const user = await createActiveUser({
      email,
      fullName,
      passwordHash,
      isAdmin,
      mustResetPassword: true,
    });
    if (!user) throw new Error("User was not created.");

    if (organisationIdRaw) {
      const organisationId = Number(organisationIdRaw);
      if (!Number.isFinite(organisationId) || organisationId <= 0) {
        return { error: "Choose a valid organisation." };
      }
      const existingOrg = await findOrganisationById(organisationId);
      if (!existingOrg) {
        return { error: "That organisation doesn’t exist." };
      }
      await addMember(user.id, Number(existingOrg.id), "member");
    } else if (organisationName.length >= 2) {
      const org = await createOrganisation(organisationName);
      await addMember(user.id, org.id, "owner");
    }

    if (stripeMode === "create") {
      await createStripeCustomerForUser(user);
    } else if (stripeMode === "assign") {
      await assignStripeCustomerToUser(user, stripeCustomerId);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create user.",
    };
  }

  return { ok: true };
}

export async function adminCreateOrganisation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || name.length < 2) {
    return { error: "Enter an organisation name." };
  }

  try {
    await createOrganisation(name, description || null);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not create the organisation.",
    };
  }

  return { ok: true };
}

export async function adminUpdateOrganisation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const websiteUrlRaw = String(formData.get("websiteUrl") ?? "").trim();
  const hostingTypeRaw = String(formData.get("hostingType") ?? "unmanaged").trim();
  const hostingType =
    hostingTypeRaw === "managed" ? "managed" : "unmanaged";
  const providerRaw = String(formData.get("unmanagedProvider") ?? "").trim();
  const unmanagedProvider: UnmanagedProvider | null =
    hostingType === "unmanaged" &&
    (providerRaw === "verpex" ||
      providerRaw === "spaceship" ||
      providerRaw === "other")
      ? providerRaw
      : null;
  const otherUrl = String(formData.get("hostingUrlOther") ?? "").trim();

  if (!Number.isFinite(organisationId)) return { error: "Invalid organisation." };
  if (!name || name.length < 2) return { error: "Enter an organisation name." };
  if (hostingType === "unmanaged" && !unmanagedProvider) {
    return { error: "Choose Verpex, Spaceship, or Other for unmanaged hosting." };
  }
  if (unmanagedProvider === "other" && !otherUrl) {
    return { error: "Enter the hosting URL for Other." };
  }

  let websiteUrl: string | null = null;
  if (websiteUrlRaw) {
    try {
      const parsed = new URL(websiteUrlRaw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "Live website must be an http(s) URL." };
      }
      websiteUrl = parsed.toString();
    } catch {
      return { error: "Enter a valid live website URL." };
    }
  }

  const hostingUrl = resolveHostingUrl({
    hostingType,
    unmanagedProvider,
    otherUrl,
  });

  try {
    await updateOrganisationDetails({
      organisationId,
      name,
      description: description || null,
      websiteUrl,
      hostingType,
      unmanagedProvider,
      hostingUrl,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not update the organisation.",
    };
  }

  revalidatePath(`/client/admin/organisations/${organisationId}`);
  revalidatePath("/client/dashboard");
  return { ok: true };
}

export async function updateOwnOrganisationDescription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) {
    return { error: "Sign in required." };
  }

  const organisationId = Number(formData.get("organisationId"));
  const description = String(formData.get("description") ?? "").trim();
  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }

  const membership = await getOrganisationMembership(
    session.userId,
    organisationId,
  );
  if (!membership) {
    return { error: "That organisation isn’t on your account." };
  }
  if (membership.role !== "owner" && !session.isAdmin) {
    return { error: "Only organisation owners can edit the description." };
  }

  await updateOrganisationDetails({
    organisationId: Number(membership.id),
    description: description || null,
  });

  return { ok: true };
}

export async function adminSendPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  const user = await findUserById(userId);
  if (!user || user.status === "disabled") {
    return { error: "User not found." };
  }

  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2);
  await setPasswordResetToken(user.id, token, expiresAt);
  await setMustResetPassword(user.id, true);

  const baseUrl = process.env.WEBAUTHN_ORIGIN?.trim() || site.url;
  const resetUrl = `${baseUrl}/client/reset-password/${token}`;

  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      fullName: user.full_name,
      resetUrl,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Reset token created but the email failed to send.",
    };
  }

  return { ok: true };
}

export async function adminUpdateUserBilling(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  const billingName = String(formData.get("billingName") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const line2 = String(formData.get("line2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postcode = String(formData.get("postcode") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!billingName || billingName.length < 2) {
    return { error: "Enter the billing name." };
  }
  if (!line1) return { error: "Enter address line 1." };
  if (!city) return { error: "Enter a city or town." };
  if (!postcode) return { error: "Enter a postcode." };
  if (!country) return { error: "Enter a country." };

  await updateUserBillingDetails(userId, {
    billingName,
    line1,
    line2,
    city,
    postcode,
    country,
    phone,
  });

  const user = await findUserById(userId);
  if (user?.stripe_customer_id) {
    try {
      await syncBillingDetailsToStripe(user, {
        billingName,
        line1,
        line2,
        city,
        postcode,
        country,
        phone,
      });
    } catch (error) {
      return {
        error: `Billing saved locally, but Stripe sync failed: ${stripeErrorMessage(error)}`,
      };
    }
  }

  return { ok: true };
}

export async function adminCreateStripeCustomer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  const user = await findUserById(userId);
  if (!user) return { error: "User not found." };

  try {
    const customer = await createStripeCustomerForUser(user);
    return { ok: true, message: `Created ${customer.id}` };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminAssignStripeCustomer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const stripeCustomerId = String(formData.get("stripeCustomerId") ?? "").trim();
  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  const user = await findUserById(userId);
  if (!user) return { error: "User not found." };

  try {
    await assignStripeCustomerToUser(user, stripeCustomerId);
    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminRemoveStripeCustomer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const userId = Number(formData.get("userId"));
  const deleteInStripe = formData.get("deleteInStripe") === "on";
  if (!Number.isFinite(userId)) return { error: "Invalid user." };

  const user = await findUserById(userId);
  if (!user) return { error: "User not found." };

  try {
    await removeStripeCustomerFromUser(user, { deleteInStripe });
    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminAssignStripeObject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const stripeObjectId = String(formData.get("stripeObjectId") ?? "").trim();
  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Choose an organisation." };
  }
  if (!stripeObjectId) return { error: "Enter a Stripe object id." };

  const org = await findOrganisationById(organisationId);
  if (!org) return { error: "Organisation not found." };

  try {
    await assignStripeObjectToOrg({ organisationId, stripeObjectId });
    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminUnassignStripeObject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const stripeObjectId = String(formData.get("stripeObjectId") ?? "").trim();
  if (!stripeObjectId) return { error: "Missing Stripe object." };

  await deleteStripeOrgAssignment(stripeObjectId);
  return { ok: true };
}

export async function adminCreateOrgInvoice(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const customerUserId = Number(formData.get("customerUserId"));
  const amountPounds = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "gbp").trim() || "gbp";
  const description = String(formData.get("description") ?? "").trim();
  const daysUntilDue = Number(formData.get("daysUntilDue") ?? 14);

  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }
  if (!Number.isFinite(customerUserId) || customerUserId <= 0) {
    return { error: "Choose whose Stripe customer to bill." };
  }
  if (!Number.isFinite(amountPounds) || amountPounds <= 0) {
    return { error: "Enter a positive amount." };
  }
  if (!description) return { error: "Enter a description." };

  const customerUser = await findUserById(customerUserId);
  if (!customerUser?.stripe_customer_id) {
    return { error: "That user has no Stripe customer linked." };
  }
  if (!userHasBillingDetails(customerUser)) {
    return {
      error:
        "Complete billing details for that person before creating invoices.",
    };
  }

  const organisation = await findOrganisationById(organisationId);
  if (!organisation) return { error: "Organisation not found." };

  const amountPence = Math.round(amountPounds * 100);

  try {
    const invoice = await createOrgInvoice({
      customerId: customerUser.stripe_customer_id,
      organisationId,
      amountPence,
      currency,
      description,
      daysUntilDue: Number.isFinite(daysUntilDue) ? daysUntilDue : 14,
    });

    if (!invoice.hostedInvoiceUrl) {
      return {
        ok: true,
        message:
          "Invoice created, but Stripe did not return a payment link to email.",
      };
    }

    try {
      await sendBillingPaymentEmail({
        toEmail: customerUser.email,
        recipientName: customerUser.full_name,
        organisationName: organisation.name,
        kind: "invoice",
        description,
        amountLabel: formatBillingAmountLabel(amountPence, currency),
        paymentUrl: invoice.hostedInvoiceUrl,
      });
    } catch (error) {
      return {
        ok: true,
        message: `Invoice created, but the payment email failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      };
    }

    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

function formatBillingAmountLabel(
  amountPence: number,
  currency: string,
  interval?: "month" | "year" | "week",
) {
  let amount: string;
  try {
    amount = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountPence / 100);
  } catch {
    amount = `${(amountPence / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
  return interval ? `${amount} / ${interval}` : amount;
}

export async function adminCreateOrgSubscription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const customerUserId = Number(formData.get("customerUserId"));
  const amountPounds = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "gbp").trim() || "gbp";
  const description = String(formData.get("description") ?? "").trim();
  const intervalRaw = String(formData.get("interval") ?? "month");
  const interval =
    intervalRaw === "year" || intervalRaw === "week" ? intervalRaw : "month";
  const daysUntilDue = Number(formData.get("daysUntilDue") ?? 14);
  const kind =
    String(formData.get("kind") ?? "standard").trim() === "maintenance"
      ? "maintenance"
      : "standard";

  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }
  if (!Number.isFinite(customerUserId) || customerUserId <= 0) {
    return { error: "Choose whose Stripe customer to bill." };
  }
  if (!Number.isFinite(amountPounds) || amountPounds <= 0) {
    return { error: "Enter a positive amount." };
  }
  if (kind === "standard" && !description) {
    return { error: "Enter a description." };
  }

  const customerUser = await findUserById(customerUserId);
  if (!customerUser?.stripe_customer_id) {
    return { error: "That user has no Stripe customer linked." };
  }
  if (!userHasBillingDetails(customerUser)) {
    return {
      error:
        "Complete billing details for that person before creating subscriptions.",
    };
  }

  const organisation = await findOrganisationById(organisationId);
  if (!organisation) return { error: "Organisation not found." };

  const amountPence = Math.round(amountPounds * 100);
  const resolvedDescription =
    kind === "maintenance"
      ? description || "Website maintenance"
      : description;

  try {
    const created = await createOrgSubscription({
      customerId: customerUser.stripe_customer_id,
      organisationId,
      amountPence,
      currency,
      description: resolvedDescription,
      interval,
      daysUntilDue: Number.isFinite(daysUntilDue) ? daysUntilDue : 14,
      kind,
    });

    const paymentUrl = created.invoice?.hostedInvoiceUrl ?? null;
    if (!paymentUrl) {
      return {
        ok: true,
        message:
          "Subscription created, but Stripe did not return a payment link to email.",
      };
    }

    try {
      await sendBillingPaymentEmail({
        toEmail: customerUser.email,
        recipientName: customerUser.full_name,
        organisationName: organisation.name,
        kind: kind === "maintenance" ? "maintenance" : "subscription",
        description: resolvedDescription,
        amountLabel: formatBillingAmountLabel(amountPence, currency, interval),
        paymentUrl,
      });
    } catch (error) {
      return {
        ok: true,
        message: `Subscription created, but the payment email failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      };
    }

    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminManageSubscription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  if (!subscriptionId.startsWith("sub_")) {
    return { error: "Invalid subscription." };
  }

  try {
    if (action === "cancel_now") {
      await cancelOrgSubscription(subscriptionId, false);
    } else if (action === "cancel_period_end") {
      await cancelOrgSubscription(subscriptionId, true);
    } else if (action === "pause") {
      await pauseOrgSubscription(subscriptionId);
    } else if (action === "resume") {
      await resumeOrgSubscription(subscriptionId);
    } else {
      return { error: "Unknown subscription action." };
    }
    return { ok: true };
  } catch (error) {
    return { error: stripeErrorMessage(error) };
  }
}

export async function adminAddMemberToOrganisation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const userId = Number(formData.get("userId"));
  const role =
    String(formData.get("role") ?? "member") === "owner" ? "owner" : "member";

  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }
  if (!Number.isFinite(userId) || userId <= 0) {
    return { error: "Invalid user." };
  }

  const org = await findOrganisationById(organisationId);
  if (!org) return { error: "Organisation not found." };

  const user = await findUserById(userId);
  if (!user || user.status === "disabled") {
    return { error: "User not found." };
  }

  try {
    await addMember(userId, organisationId, role);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not add the member.",
    };
  }

  return { ok: true };
}

function parseCommaList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseColours(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, hex] = line.split("|").map((part) => part.trim());
      return { name: name || "Colour", hex: hex || "#000000" };
    })
    .filter((colour) => Boolean(colour.hex));
}

export async function adminUpsertOrganisationCaseStudy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }

  const org = await findOrganisationById(organisationId);
  if (!org) return { error: "Organisation not found." };

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const logo = String(formData.get("logo") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const overview = String(formData.get("overview") ?? "").trim();
  const challenge = String(formData.get("challenge") ?? "").trim();
  const solution = String(formData.get("solution") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "").trim();
  const services = parseCommaList(formData.get("services"));
  const designTools = parseCommaList(formData.get("designTools"));
  const stack = parseCommaList(formData.get("stack"));
  const highlights = parseCommaList(formData.get("highlights"));
  const colours = parseColours(formData.get("colours"));

  if (!title || title.length < 2) return { error: "Enter a title." };
  if (!slug) return { error: "Enter a portfolio slug." };
  if (!url) return { error: "Enter the live site URL." };
  if (!logo) return { error: "Enter a logo path." };
  if (!year) return { error: "Enter a year." };
  if (!summary) return { error: "Enter a summary." };
  if (!overview) return { error: "Enter an overview." };
  if (!challenge) return { error: "Enter the challenge." };
  if (!solution) return { error: "Enter the solution." };
  if (!outcome) return { error: "Enter the outcome." };
  if (services.length === 0) return { error: "Add at least one service." };
  if (designTools.length === 0) return { error: "Add at least one design tool." };
  if (stack.length === 0) return { error: "Add at least one stack item." };
  if (colours.length === 0) {
    return { error: "Add at least one colour as Name|#hex." };
  }

  try {
    await upsertCaseStudy({
      organisationId,
      slug,
      title,
      url,
      logo,
      logoLight: formData.get("logoLight") === "on",
      services,
      featured: formData.get("featured") === "on",
      summary,
      overview,
      challenge,
      solution,
      outcome,
      designTools,
      stack,
      colours,
      highlights,
      year,
      seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
      seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
      seoHeadline: String(formData.get("seoHeadline") ?? "").trim() || null,
      showOnLocal: formData.get("showOnLocal") === "on",
      showOnCharity: formData.get("showOnCharity") === "on",
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save the case study.",
    };
  }

  return { ok: true };
}

export async function adminDeleteOrganisationCaseStudy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Invalid organisation." };
  }

  await deleteCaseStudy(organisationId);
  return { ok: true };
}

export async function changeForcedPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await readSession();
  if (!session || session.pending2fa) {
    return { error: "Sign in required." };
  }

  const user = await findUserById(session.userId);
  if (!user?.must_reset_password) {
    return { error: "Password change isn’t required." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!isStrongPassword(password)) {
    return {
      error:
        "Password must be at least 10 characters and include a letter and a number.",
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const passwordHash = await hashPassword(password);
  await clearPasswordResetAndSetPassword(user.id, passwordHash);
  return { ok: true };
}

export async function completePasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { error: "Reset link is invalid." };
  if (!isStrongPassword(password)) {
    return {
      error:
        "Password must be at least 10 characters and include a letter and a number.",
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = await findUserByPasswordResetToken(token);
  if (!user) {
    return { error: "This reset link has expired or already been used." };
  }

  const passwordHash = await hashPassword(password);
  await clearPasswordResetAndSetPassword(user.id, passwordHash);
  return { ok: true };
}

export async function adminSendOrganisationContract(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const organisationId = Number(formData.get("organisationId"));
  const templateId = Number(formData.get("templateId"));
  if (!Number.isFinite(organisationId) || organisationId <= 0) {
    return { error: "Choose an organisation." };
  }
  if (!Number.isFinite(templateId) || templateId <= 0) {
    return { error: "Choose a contract template." };
  }

  const [organisation, template, owners] = await Promise.all([
    findOrganisationById(organisationId),
    findContractTemplateById(templateId),
    listOrganisationOwners(organisationId),
  ]);

  if (!organisation) return { error: "Organisation not found." };
  if (!template || !template.is_active) {
    return { error: "That contract template isn\u2019t available." };
  }
  if (owners.length === 0) {
    return {
      error: "This organisation has no owner to email. Assign an owner first.",
    };
  }

  const scope = String(formData.get("scope") ?? "").trim();
  const fees = String(formData.get("fees") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    scope.length > 20000 ||
    fees.length > 20000 ||
    timeline.length > 20000 ||
    notes.length > 20000
  ) {
    return { error: "One of the particulars fields is too long." };
  }

  const primaryOwner = owners[0];
  const sendFields = {
    organisationName: organisation.name,
    clientName: primaryOwner.full_name?.trim() || primaryOwner.email,
    clientEmail: primaryOwner.email,
    scope: scope || null,
    fees: fees || null,
    timeline: timeline || null,
    notes: notes || null,
  };

  let bodyHtml = renderContractPlaceholders(template.body_html, sendFields);

  // Templates without {{scope}}/{{fees}}/… still receive pasted particulars.
  if (!templateUsesParticularsPlaceholders(template.body_html)) {
    const particulars = buildContractParticularsSection(sendFields);
    if (particulars) {
      bodyHtml = `${bodyHtml}\n${particulars}`;
    }
  }

  try {
    const contract = await createOrganisationContract({
      organisationId,
      templateId: template.id,
      title: template.title,
      bodyHtml,
      sentByUserId: session.userId,
    });
    if (!contract) throw new Error("Contract was not created.");

    const baseUrl = process.env.WEBAUTHN_ORIGIN?.trim() || site.url;
    const dashboardUrl = `${baseUrl}/client/dashboard`;

    for (const owner of owners) {
      await sendContractForSignatureEmail({
        toEmail: owner.email,
        toName: owner.full_name,
        organisationName: organisation.name,
        contractTitle: contract.title,
        contractBodyHtml: contract.body_html,
        dashboardUrl,
      });
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not send the contract.",
    };
  }

  return {
    ok: true,
    message: `Sent to ${owners.length} owner${owners.length === 1 ? "" : "s"}.`,
  };
}

export async function adminWithdrawOrganisationContract(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const contractId = Number(formData.get("contractId"));
  if (!Number.isFinite(contractId) || contractId <= 0) {
    return { error: "Invalid contract." };
  }

  try {
    await withdrawOrganisationContract(contractId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not withdraw the contract.",
    };
  }

  revalidatePath("/client/admin/contracts");
  revalidatePath("/client/dashboard");
  return { ok: true, message: "Contract withdrawn." };
}

export async function adminDeleteOrganisationContract(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const contractId = Number(formData.get("contractId"));
  if (!Number.isFinite(contractId) || contractId <= 0) {
    return { error: "Invalid contract." };
  }

  try {
    await deleteOrganisationContract(contractId);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not delete the contract.",
    };
  }

  revalidatePath("/client/admin/contracts");
  revalidatePath("/client/dashboard");
  return { ok: true, message: "Contract deleted." };
}

export async function adminUpdateContractTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const templateId = Number(formData.get("templateId"));
  const title = String(formData.get("title") ?? "").trim();
  const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!Number.isFinite(templateId) || templateId <= 0) {
    return { error: "Invalid template." };
  }
  if (!title) return { error: "Enter a title." };
  if (!bodyHtml) return { error: "Enter contract content (HTML)." };

  try {
    await updateContractTemplate({
      id: templateId,
      title,
      bodyHtml,
      isActive,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not update the template.",
    };
  }

  return { ok: true };
}

export async function adminUpdateHourlyRate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdminSession();
  if (!session) return { error: "Admin access required." };

  const raw = String(formData.get("hourlyRatePounds") ?? "").trim();
  const pounds = Number.parseFloat(raw);
  if (!Number.isFinite(pounds) || pounds < 0) {
    return { error: "Enter a valid hourly rate in pounds." };
  }

  const pence = Math.round(pounds * 100);
  try {
    await setHourlyRatePence(pence);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not update the hourly rate.",
    };
  }

  revalidatePath("/client/admin/settings");
  revalidatePath("/client/dashboard");
  return {
    ok: true,
    message: `Hourly rate set to ${formatGbpFromPence(pence)} per hour.`,
  };
}

export async function signOrganisationContractAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();
  if (!session) return { error: "Sign in required." };

  const contractId = Number(formData.get("contractId"));
  const signerName = String(formData.get("signerName") ?? "").trim();
  const signatureTypeRaw = String(formData.get("signatureType") ?? "typed");
  const signatureType =
    signatureTypeRaw === "drawn" ? "drawn" : ("typed" as const);
  const signatureData = String(formData.get("signatureData") ?? "").trim();
  const ipAddress = String(formData.get("ipAddress") ?? "").trim() || null;
  const userAgent = String(formData.get("userAgent") ?? "").trim() || null;

  if (!Number.isFinite(contractId) || contractId <= 0) {
    return { error: "Invalid contract." };
  }
  if (signerName.length < 2) {
    return { error: "Enter your full name to sign." };
  }
  if (!signatureData) {
    return {
      error:
        signatureType === "drawn"
          ? "Draw your signature before submitting."
          : "Type your signature before submitting.",
    };
  }

  const user = await findUserById(session.userId);
  if (!user) return { error: "Account not found." };

  const contract = await findOrganisationContractById(contractId);
  if (!contract) return { error: "Contract not found." };
  if (contract.organisation_id !== session.organisationId) {
    return { error: "That contract isn\u2019t for your active organisation." };
  }
  if (contract.status !== "pending") {
    return { error: "This contract is already signed or closed." };
  }

  const membership = await getOrganisationMembership(
    session.userId,
    contract.organisation_id,
  );
  if (!membership) {
    return { error: "You\u2019re not a member of this organisation." };
  }
  if (membership.role !== "owner" && !session.isAdmin) {
    return { error: "Only organisation owners can sign contracts." };
  }

  try {
    const signed = await signOrganisationContract({
      contractId,
      signerUserId: user.id,
      signerName,
      signerEmail: user.email,
      signatureData,
      signatureType,
      ipAddress,
      userAgent,
    });
    if (!signed?.signed_at || !signed.signed_payload_hash) {
      throw new Error("Signing failed.");
    }

    const organisation = await findOrganisationById(contract.organisation_id);
    await sendSignedContractCopies({
      clientEmail: user.email,
      clientName: user.full_name,
      organisationName: organisation?.name || "Organisation",
      contractTitle: signed.title,
      contractBodyHtml: signed.body_html,
      signedAt: signed.signed_at,
      signerName: signed.signer_name || signerName,
      contentHash: signed.content_hash,
      signedPayloadHash: signed.signed_payload_hash,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not sign the contract.",
    };
  }

  return {
    ok: true,
    message: "Contract signed. A copy has been emailed to you.",
  };
}
