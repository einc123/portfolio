import { execute, queryRows } from "@/lib/db";

export type StripeOrgAssignment = {
  id: number;
  organisation_id: number;
  stripe_object_id: string;
  stripe_object_type: "invoice" | "subscription" | "payment_intent" | "charge";
  label: string | null;
  created_at: string;
  updated_at: string;
};

export async function setUserStripeCustomerId(
  userId: number,
  stripeCustomerId: string | null,
) {
  await execute(
    `UPDATE client_users
     SET stripe_customer_id = :stripeCustomerId,
         updated_at = datetime('now')
     WHERE id = :id`,
    { id: userId, stripeCustomerId },
  );
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
  const rows = await queryRows<{ id: number; email: string }>(
    `SELECT id, email FROM client_users
     WHERE stripe_customer_id = :stripeCustomerId
     LIMIT 1`,
    { stripeCustomerId },
  );
  return rows[0] ?? null;
}

export async function listOrgStripeAssignments(organisationId: number) {
  return queryRows<StripeOrgAssignment>(
    `SELECT * FROM stripe_org_assignments
     WHERE organisation_id = :organisationId
     ORDER BY created_at DESC, id DESC`,
    { organisationId },
  );
}

export async function listUserOrgStripeAssignments(userId: number) {
  return queryRows<StripeOrgAssignment & { organisation_name: string }>(
    `SELECT a.*, o.name AS organisation_name
     FROM stripe_org_assignments a
     INNER JOIN client_organisations o ON o.id = a.organisation_id
     INNER JOIN client_organisation_members m
       ON m.organisation_id = a.organisation_id AND m.user_id = :userId
     ORDER BY a.created_at DESC, a.id DESC`,
    { userId },
  );
}

export async function upsertStripeOrgAssignment(input: {
  organisationId: number;
  stripeObjectId: string;
  stripeObjectType: StripeOrgAssignment["stripe_object_type"];
  label?: string | null;
}) {
  const existing = await queryRows<StripeOrgAssignment>(
    `SELECT * FROM stripe_org_assignments
     WHERE stripe_object_id = :stripeObjectId
     LIMIT 1`,
    { stripeObjectId: input.stripeObjectId },
  );
  if (existing[0]) {
    await execute(
      `UPDATE stripe_org_assignments
       SET organisation_id = :organisationId,
           stripe_object_type = :stripeObjectType,
           label = :label,
           updated_at = datetime('now')
       WHERE stripe_object_id = :stripeObjectId`,
      {
        organisationId: input.organisationId,
        stripeObjectType: input.stripeObjectType,
        label: input.label?.trim() || null,
        stripeObjectId: input.stripeObjectId,
      },
    );
    return existing[0].id;
  }

  const result = await execute(
    `INSERT INTO stripe_org_assignments
      (organisation_id, stripe_object_id, stripe_object_type, label)
     VALUES
      (:organisationId, :stripeObjectId, :stripeObjectType, :label)`,
    {
      organisationId: input.organisationId,
      stripeObjectId: input.stripeObjectId,
      stripeObjectType: input.stripeObjectType,
      label: input.label?.trim() || null,
    },
  );
  return result.insertId;
}

export async function deleteStripeOrgAssignment(stripeObjectId: string) {
  await execute(
    `DELETE FROM stripe_org_assignments WHERE stripe_object_id = :stripeObjectId`,
    { stripeObjectId },
  );
}
