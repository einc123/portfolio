import {
  execute,
  queryRows,
  slugify,
  type DbMembership,
  type DbOrganisation,
  type DbPasskey,
  type DbUser,
} from "@/lib/db";
import { organisationHasCaseStudy } from "@/lib/caseStudies";

export async function findUserByEmail(email: string) {
  const rows = await queryRows<DbUser>(
    `SELECT * FROM client_users WHERE email = :email LIMIT 1`,
    { email: email.toLowerCase() },
  );
  return rows[0] ?? null;
}

export async function findUserById(id: number) {
  const rows = await queryRows<DbUser>(
    `SELECT * FROM client_users WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ?? null;
}

export async function findUserByInviteToken(token: string) {
  const rows = await queryRows<DbUser>(
    `SELECT * FROM client_users
     WHERE invite_token = :token
       AND status = 'invited'
       AND (invite_expires_at IS NULL OR invite_expires_at > datetime('now'))
     LIMIT 1`,
    { token },
  );
  return rows[0] ?? null;
}

export async function getUserOrganisations(userId: number) {
  return queryRows<DbMembership>(
    `SELECT o.id, o.name, o.slug, o.billing_confirmed, o.description, m.role
     FROM client_organisation_members m
     INNER JOIN client_organisations o ON o.id = m.organisation_id
     WHERE m.user_id = :userId
     ORDER BY o.name ASC`,
    { userId },
  );
}

/** Membership check — only returns an org the user actually belongs to. */
export async function getOrganisationMembership(
  userId: number,
  organisationId: number,
) {
  const id = Number(organisationId);
  if (!Number.isFinite(id) || id <= 0) return null;

  const rows = await queryRows<DbMembership>(
    `SELECT o.id, o.name, o.slug, o.billing_confirmed, o.description, m.role
     FROM client_organisation_members m
     INNER JOIN client_organisations o ON o.id = m.organisation_id
     WHERE m.user_id = :userId
       AND m.organisation_id = :organisationId
     LIMIT 1`,
    { userId, organisationId: id },
  );
  return rows[0] ?? null;
}

export async function getPasskeysForUser(userId: number) {
  return queryRows<DbPasskey>(
    `SELECT * FROM client_webauthn_credentials WHERE user_id = :userId`,
    { userId },
  );
}

export async function findPasskeyByCredentialId(credentialId: string) {
  const rows = await queryRows<DbPasskey>(
    `SELECT * FROM client_webauthn_credentials WHERE credential_id = :credentialId LIMIT 1`,
    { credentialId },
  );
  return rows[0] ?? null;
}

export async function updatePasskeyCounter(id: number, counter: number) {
  await execute(
    `UPDATE client_webauthn_credentials SET counter = :counter WHERE id = :id`,
    { id, counter },
  );
}

export async function savePasskey(input: {
  userId: number;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string;
  deviceType?: string;
  backedUp?: boolean;
}) {
  await execute(
    `INSERT INTO client_webauthn_credentials
      (user_id, credential_id, public_key, counter, transports, device_type, backed_up)
     VALUES
      (:userId, :credentialId, :publicKey, :counter, :transports, :deviceType, :backedUp)`,
    {
      userId: input.userId,
      credentialId: input.credentialId,
      publicKey: input.publicKey,
      counter: input.counter,
      transports: input.transports ?? null,
      deviceType: input.deviceType ?? null,
      backedUp: input.backedUp ? 1 : 0,
    },
  );
}

function isUniqueViolation(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("UNIQUE") ||
    message.includes("constraint failed") ||
    (error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

export async function createOrganisation(name: string, description?: string | null) {
  const base = slugify(name) || `org-${Date.now()}`;
  let slug = base;
  let attempt = 1;

  while (true) {
    try {
      const result = await execute(
        `INSERT INTO client_organisations (name, slug, description) VALUES (:name, :slug, :description)`,
        { name, slug, description: description?.trim() || null },
      );
      return { id: result.insertId, name, slug };
    } catch (error) {
      if (!isUniqueViolation(error) || attempt > 20) throw error;
      attempt += 1;
      slug = `${base}-${attempt}`;
    }
  }
}

export async function addMember(
  userId: number,
  organisationId: number,
  role: "member" | "owner" = "member",
) {
  await execute(
    `INSERT INTO client_organisation_members (user_id, organisation_id, role)
     VALUES (:userId, :organisationId, :role)
     ON CONFLICT(user_id, organisation_id) DO UPDATE SET role = excluded.role`,
    { userId, organisationId, role },
  );
}

export async function inviteClientUser(input: {
  email: string;
  inviteToken: string;
  expiresAt: Date;
  /** Create a new organisation with this name (invitee becomes owner). */
  organisationName?: string;
  /** Attach to an existing organisation instead of creating one. */
  organisationId?: number;
  role?: "member" | "owner";
}) {
  const email = input.email.toLowerCase();
  let user = await findUserByEmail(email);

  if (user?.status === "active") {
    throw new Error(
      "That email already has an active client account. Add them to an organisation separately.",
    );
  }

  if (!user) {
    const result = await execute(
      `INSERT INTO client_users
        (email, status, invite_token, invite_expires_at)
       VALUES
        (:email, 'invited', :token, :expires)`,
      {
        email,
        token: input.inviteToken,
        expires: input.expiresAt,
      },
    );
    user = await findUserById(result.insertId);
  } else {
    await execute(
      `UPDATE client_users
       SET status = 'invited',
           invite_token = :token,
           invite_expires_at = :expires,
           updated_at = datetime('now')
       WHERE id = :id`,
      {
        id: user.id,
        token: input.inviteToken,
        expires: input.expiresAt,
      },
    );
    user = await findUserById(user.id);
  }

  if (!user) throw new Error("Failed to create invited user.");

  let organisation: DbOrganisation;
  if (input.organisationId) {
    const existing = await findOrganisationById(input.organisationId);
    if (!existing) {
      throw new Error("That organisation doesn’t exist.");
    }
    organisation = existing;
    await addMember(
      user.id,
      Number(existing.id),
      input.role === "owner" ? "owner" : "member",
    );
  } else {
    const name = input.organisationName?.trim() ?? "";
    if (name.length < 2) {
      throw new Error("Enter an organisation name or choose an existing one.");
    }
    const created = await createOrganisation(name);
    await addMember(user.id, created.id, "owner");
    const full = await findOrganisationById(created.id);
    if (!full) throw new Error("Organisation was created but could not be loaded.");
    organisation = full;
  }

  return { user, organisation };
}

export async function completeInviteRegistration(input: {
  userId: number;
  fullName: string;
  passwordHash: string;
  organisationId: number;
  organisationName: string;
}) {
  await execute(
    `UPDATE client_users
     SET full_name = :fullName,
         password_hash = :passwordHash,
         status = 'active',
         invite_token = NULL,
         invite_expires_at = NULL,
         billing_confirmed = 0,
         updated_at = datetime('now')
     WHERE id = :id`,
    {
      id: input.userId,
      fullName: input.fullName,
      passwordHash: input.passwordHash,
    },
  );

  await execute(
    `UPDATE client_organisations
     SET name = :name,
         updated_at = datetime('now')
     WHERE id = :id`,
    {
      id: input.organisationId,
      name: input.organisationName,
    },
  );
}

export function userHasBillingDetails(
  user: Pick<
    DbUser,
    | "billing_confirmed"
    | "billing_name"
    | "billing_line1"
    | "billing_city"
    | "billing_postcode"
    | "billing_country"
  >,
) {
  return Boolean(
    user.billing_confirmed &&
      user.billing_name?.trim() &&
      user.billing_line1?.trim() &&
      user.billing_city?.trim() &&
      user.billing_postcode?.trim() &&
      user.billing_country?.trim(),
  );
}

export async function updateUserProfileName(userId: number, fullName: string) {
  await execute(
    `UPDATE client_users
     SET full_name = :fullName,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, fullName },
  );
}

export async function updateUserBillingDetails(
  userId: number,
  input: {
    billingName: string;
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    country: string;
    phone: string;
  },
) {
  await execute(
    `UPDATE client_users
     SET billing_name = :billingName,
         billing_line1 = :line1,
         billing_line2 = :line2,
         billing_city = :city,
         billing_postcode = :postcode,
         billing_country = :country,
         billing_phone = :phone,
         billing_confirmed = 1,
         updated_at = datetime('now')
     WHERE id = :id`,
    {
      id: userId,
      billingName: input.billingName,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      postcode: input.postcode,
      country: input.country,
      phone: input.phone || null,
    },
  );
}

export async function listAllUsers() {
  return queryRows<DbUser>(
    `SELECT * FROM client_users ORDER BY created_at DESC, id DESC`,
  );
}

export async function listAllOrganisations() {
  return queryRows<DbOrganisation>(
    `SELECT * FROM client_organisations ORDER BY name ASC`,
  );
}

export async function findOrganisationById(organisationId: number) {
  const id = Number(organisationId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const rows = await queryRows<DbOrganisation>(
    `SELECT * FROM client_organisations WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ?? null;
}

export async function listOrganisationMemberStripeCustomerIds(
  organisationId: number,
) {
  const id = Number(organisationId);
  if (!Number.isFinite(id) || id <= 0) return [];
  const rows = await queryRows<{ stripe_customer_id: string }>(
    `SELECT u.stripe_customer_id
     FROM client_organisation_members m
     INNER JOIN client_users u ON u.id = m.user_id
     WHERE m.organisation_id = :id
       AND u.stripe_customer_id IS NOT NULL`,
    { id },
  );
  return [
    ...new Set(rows.map((row) => row.stripe_customer_id).filter(Boolean)),
  ];
}

export async function setUserAdminFlag(userId: number, isAdmin: boolean) {
  await execute(
    `UPDATE client_users
     SET is_admin = :isAdmin,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, isAdmin: isAdmin ? 1 : 0 },
  );
}

export async function updateUserByAdmin(input: {
  userId: number;
  fullName: string;
  email: string;
  status: "invited" | "active" | "disabled";
  isAdmin: boolean;
}) {
  await execute(
    `UPDATE client_users
     SET full_name = :fullName,
         email = :email,
         status = :status,
         is_admin = :isAdmin,
         updated_at = datetime('now')
     WHERE id = :id`,
    {
      id: input.userId,
      fullName: input.fullName || null,
      email: input.email.toLowerCase(),
      status: input.status,
      isAdmin: input.isAdmin ? 1 : 0,
    },
  );
}

export async function removeMember(userId: number, organisationId: number) {
  await execute(
    `DELETE FROM client_organisation_members
     WHERE user_id = :userId AND organisation_id = :organisationId`,
    { userId, organisationId },
  );
}

export async function renameOrganisation(organisationId: number, name: string) {
  const hasCaseStudy = await organisationHasCaseStudy(organisationId);

  if (hasCaseStudy) {
    await execute(
      `UPDATE client_organisations
       SET name = :name,
           updated_at = datetime('now')
       WHERE id = :id`,
      { id: organisationId, name },
    );
    return;
  }

  const base = slugify(name) || `org-${Date.now()}`;
  let slug = base;
  let attempt = 1;

  while (true) {
    try {
      await execute(
        `UPDATE client_organisations
         SET name = :name,
             slug = :slug,
             updated_at = datetime('now')
         WHERE id = :id`,
        { id: organisationId, name, slug },
      );
      return;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt > 20) throw error;
      attempt += 1;
      slug = `${base}-${attempt}`;
    }
  }
}

export async function updateOrganisationDetails(input: {
  organisationId: number;
  name?: string;
  description?: string | null;
  hostingType?: "managed" | "unmanaged";
  unmanagedProvider?: "verpex" | "spaceship" | "other" | null;
  hostingUrl?: string | null;
  websiteUrl?: string | null;
}) {
  if (input.name !== undefined) {
    await renameOrganisation(input.organisationId, input.name);
  }
  if (input.description !== undefined) {
    await execute(
      `UPDATE client_organisations
       SET description = :description,
           updated_at = datetime('now')
       WHERE id = :id`,
      {
        id: input.organisationId,
        description: input.description?.trim() || null,
      },
    );
  }
  if (input.websiteUrl !== undefined) {
    await execute(
      `UPDATE client_organisations
       SET website_url = :websiteUrl,
           updated_at = datetime('now')
       WHERE id = :id`,
      {
        id: input.organisationId,
        websiteUrl: input.websiteUrl?.trim() || null,
      },
    );
  }
  if (input.hostingType !== undefined) {
    const isManaged = input.hostingType === "managed";
    await execute(
      `UPDATE client_organisations
       SET hosting_type = :hostingType,
           unmanaged_provider = :unmanagedProvider,
           hosting_url = :hostingUrl,
           updated_at = datetime('now')
       WHERE id = :id`,
      {
        id: input.organisationId,
        hostingType: input.hostingType,
        unmanagedProvider: isManaged
          ? null
          : (input.unmanagedProvider ?? null),
        hostingUrl: isManaged ? null : (input.hostingUrl ?? null),
      },
    );
  }
}

export async function createActiveUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  isAdmin?: boolean;
  mustResetPassword?: boolean;
}) {
  const result = await execute(
    `INSERT INTO client_users
      (email, full_name, password_hash, is_admin, status, billing_confirmed, must_reset_password)
     VALUES
      (:email, :fullName, :passwordHash, :isAdmin, 'active', 0, :mustReset)`,
    {
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash: input.passwordHash,
      isAdmin: input.isAdmin ? 1 : 0,
      mustReset: input.mustResetPassword === false ? 0 : 1,
    },
  );
  return findUserById(result.insertId);
}

export async function setMustResetPassword(userId: number, value: boolean) {
  await execute(
    `UPDATE client_users
     SET must_reset_password = :value,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, value: value ? 1 : 0 },
  );
}

export async function setPasswordResetToken(
  userId: number,
  token: string,
  expiresAt: Date,
) {
  await execute(
    `UPDATE client_users
     SET password_reset_token = :token,
         password_reset_expires_at = :expires,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, token, expires: expiresAt },
  );
}

export async function findUserByPasswordResetToken(token: string) {
  const rows = await queryRows<DbUser>(
    `SELECT * FROM client_users
     WHERE password_reset_token = :token
       AND (password_reset_expires_at IS NULL OR password_reset_expires_at > datetime('now'))
     LIMIT 1`,
    { token },
  );
  return rows[0] ?? null;
}

export async function clearPasswordResetAndSetPassword(
  userId: number,
  passwordHash: string,
) {
  await execute(
    `UPDATE client_users
     SET password_hash = :passwordHash,
         must_reset_password = 0,
         password_reset_token = NULL,
         password_reset_expires_at = NULL,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, passwordHash },
  );
}

export async function getOrganisationsWithMemberSummary() {
  const organisations = await listAllOrganisations();
  const memberships = await queryRows<{
    user_id: number;
    organisation_id: number;
    role: string;
    email: string;
    full_name: string | null;
  }>(
    `SELECT m.user_id, m.organisation_id, m.role, u.email, u.full_name
     FROM client_organisation_members m
     INNER JOIN client_users u ON u.id = m.user_id
     ORDER BY u.full_name ASC, u.email ASC`,
  );

  return organisations.map((org) => ({
    ...org,
    members: memberships
      .filter((row) => row.organisation_id === org.id)
      .map((row) => ({
        id: row.user_id,
        email: row.email,
        full_name: row.full_name,
        role: row.role as "member" | "owner",
      })),
  }));
}

export async function getUsersWithOrganisationSummary() {
  const users = await listAllUsers();
  const memberships = await queryRows<{
    user_id: number;
    organisation_id: number;
    name: string;
    role: string;
  }>(
    `SELECT m.user_id, m.organisation_id, o.name, m.role
     FROM client_organisation_members m
     INNER JOIN client_organisations o ON o.id = m.organisation_id
     ORDER BY o.name ASC`,
  );

  return users.map((user) => ({
    ...user,
    organisations: memberships
      .filter((row) => row.user_id === user.id)
      .map((row) => ({
        id: row.organisation_id,
        name: row.name,
        role: row.role as "member" | "owner",
      })),
  }));
}

export async function setUserTotp(
  userId: number,
  secret: string | null,
  enabled: boolean,
) {
  await execute(
    `UPDATE client_users
     SET totp_secret = :secret,
         totp_enabled = :enabled,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, secret, enabled: enabled ? 1 : 0 },
  );
}

export async function updateUserAppearancePreferences(
  userId: number,
  input: {
    theme?: "light" | "dark" | null;
    accent?: string | null;
  },
) {
  const theme =
    input.theme === "light" || input.theme === "dark" ? input.theme : null;
  const accent = input.accent?.trim() || null;

  if (theme && accent) {
    await execute(
      `UPDATE client_users
       SET preferred_theme = :theme,
           preferred_accent = :accent,
           updated_at = datetime('now')
       WHERE id = :id`,
      { id: userId, theme, accent },
    );
    return;
  }

  if (theme) {
    await execute(
      `UPDATE client_users
       SET preferred_theme = :theme,
           updated_at = datetime('now')
       WHERE id = :id`,
      { id: userId, theme },
    );
  }

  if (accent) {
    await execute(
      `UPDATE client_users
       SET preferred_accent = :accent,
           updated_at = datetime('now')
       WHERE id = :id`,
      { id: userId, accent },
    );
  }
}
