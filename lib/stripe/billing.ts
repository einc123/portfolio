import type Stripe from "stripe";
import type { DbUser } from "@/lib/db";
import { getStripe, stripeErrorMessage } from "@/lib/stripe/client";
import { toStripeCountryCode } from "@/lib/stripe/country";
import {
  findUserByStripeCustomerId,
  setUserStripeCustomerId,
  upsertStripeOrgAssignment,
} from "@/lib/stripe/store";

/** Stripe Tax product code for website design / web development services. */
export const WEB_DEVELOPMENT_TAX_CODE = "txcd_10701200";

export type BillingAddressInput = {
  billingName: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
};

function customerAddress(input: BillingAddressInput): Stripe.AddressParam {
  return {
    line1: input.line1,
    line2: input.line2 || undefined,
    city: input.city,
    postal_code: input.postcode,
    country: toStripeCountryCode(input.country),
  };
}

export async function createStripeCustomerForUser(user: DbUser) {
  if (user.stripe_customer_id) {
    throw new Error("This user already has a Stripe customer linked.");
  }

  const stripe = await getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.billing_name?.trim() || user.full_name?.trim() || undefined,
    phone: user.billing_phone?.trim() || undefined,
    address:
      user.billing_line1 && user.billing_city && user.billing_postcode && user.billing_country
        ? {
            line1: user.billing_line1,
            line2: user.billing_line2 || undefined,
            city: user.billing_city,
            postal_code: user.billing_postcode,
            country: toStripeCountryCode(user.billing_country),
          }
        : undefined,
    metadata: {
      portal_user_id: String(user.id),
    },
  });

  await setUserStripeCustomerId(user.id, customer.id);
  return customer;
}

export async function assignStripeCustomerToUser(
  user: DbUser,
  stripeCustomerId: string,
) {
  const id = stripeCustomerId.trim();
  if (!id.startsWith("cus_")) {
    throw new Error("Enter a valid Stripe customer id (cus_…).");
  }

  const taken = await findUserByStripeCustomerId(id);
  if (taken && taken.id !== user.id) {
    throw new Error(`That Stripe customer is already linked to ${taken.email}.`);
  }

  const stripe = await getStripe();
  const customer = await stripe.customers.retrieve(id);
  if (customer.deleted) {
    throw new Error("That Stripe customer has been deleted.");
  }

  await stripe.customers.update(id, {
    metadata: {
      ...customer.metadata,
      portal_user_id: String(user.id),
    },
  });

  await setUserStripeCustomerId(user.id, id);
  return customer;
}

export async function removeStripeCustomerFromUser(
  user: DbUser,
  options?: { deleteInStripe?: boolean },
) {
  if (!user.stripe_customer_id) {
    throw new Error("No Stripe customer is linked.");
  }

  if (options?.deleteInStripe) {
    const stripe = await getStripe();
    await stripe.customers.del(user.stripe_customer_id);
  }

  await setUserStripeCustomerId(user.id, null);
}

export async function syncBillingDetailsToStripe(
  user: DbUser,
  input: BillingAddressInput,
) {
  if (!user.stripe_customer_id) return null;

  const stripe = await getStripe();
  return stripe.customers.update(user.stripe_customer_id, {
    name: input.billingName,
    phone: input.phone || undefined,
    email: user.email,
    address: customerAddress(input),
    metadata: {
      portal_user_id: String(user.id),
    },
  });
}

/** Ensure the portal user has a Stripe customer, creating one from billing details if needed. */
export async function ensureStripeCustomerForUser(user: DbUser) {
  if (user.stripe_customer_id) {
    if (
      user.billing_name &&
      user.billing_line1 &&
      user.billing_city &&
      user.billing_postcode &&
      user.billing_country
    ) {
      await syncBillingDetailsToStripe(user, {
        billingName: user.billing_name,
        line1: user.billing_line1,
        line2: user.billing_line2 || "",
        city: user.billing_city,
        postcode: user.billing_postcode,
        country: user.billing_country,
        phone: user.billing_phone || "",
      });
    }
    return user.stripe_customer_id;
  }

  const customer = await createStripeCustomerForUser(user);
  return customer.id;
}

export async function customerHasDefaultPaymentMethod(customerId: string) {
  const stripe = await getStripe();
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return false;

  const defaultPm = customer.invoice_settings?.default_payment_method;
  if (defaultPm) return true;

  const cards = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
    limit: 1,
  });
  return cards.data.length > 0;
}

export async function getCustomerPaymentMethodSummary(customerId: string) {
  const stripe = await getStripe();
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    return { hasPaymentMethod: false, brand: null as string | null, last4: null as string | null };
  }

  let paymentMethodId =
    typeof customer.invoice_settings?.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings?.default_payment_method?.id ?? null;

  if (!paymentMethodId) {
    const cards = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });
    paymentMethodId = cards.data[0]?.id ?? null;
  }

  if (!paymentMethodId) {
    return { hasPaymentMethod: false, brand: null, last4: null };
  }

  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  return {
    hasPaymentMethod: true,
    brand: pm.card?.brand ?? null,
    last4: pm.card?.last4 ?? null,
  };
}

export async function createCustomerSetupIntent(customerId: string) {
  const stripe = await getStripe();
  const intent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: {
      purpose: "portal_default_payment_method",
    },
  });
  if (!intent.client_secret) {
    throw new Error("Stripe did not return a setup client secret.");
  }
  return {
    clientSecret: intent.client_secret,
    setupIntentId: intent.id,
  };
}

export async function setCustomerDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string,
) {
  const stripe = await getStripe();
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const pmCustomer =
    typeof pm.customer === "string" ? pm.customer : pm.customer?.id;
  if (pmCustomer !== customerId) {
    throw new Error("That payment method does not belong to this customer.");
  }

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Attach as default on active subscriptions so renewals use the new card.
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  await Promise.all(
    subscriptions.data
      .filter((sub) =>
        ["active", "trialing", "past_due", "unpaid", "paused"].includes(
          sub.status,
        ),
      )
      .map((sub) =>
        stripe.subscriptions.update(sub.id, {
          default_payment_method: paymentMethodId,
        }),
      ),
  );

  return {
    brand: pm.card?.brand ?? null,
    last4: pm.card?.last4 ?? null,
  };
}

export type PortalInvoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  organisationId: string | null;
  description: string | null;
};

export type PortalPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  receiptUrl: string | null;
  organisationId: string | null;
};

export type PortalSubscription = {
  id: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  paused: boolean;
  currentPeriodEnd: number | null;
  created: number;
  currency: string | null;
  amount: number | null;
  interval: string | null;
  productName: string | null;
  organisationId: string | null;
  latestInvoiceId: string | null;
  kind: "standard" | "maintenance";
};

function orgMeta(metadata: Stripe.Metadata | null | undefined) {
  return metadata?.organisation_id?.trim() || null;
}

export function mapInvoice(invoice: Stripe.Invoice): PortalInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    created: invoice.created,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
    organisationId: orgMeta(invoice.metadata),
    description: invoice.description ?? null,
  };
}

export function mapCharge(charge: Stripe.Charge): PortalPayment {
  return {
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status: charge.status,
    created: charge.created,
    description: charge.description,
    receiptUrl: charge.receipt_url,
    organisationId: orgMeta(charge.metadata),
  };
}

export function mapSubscription(sub: Stripe.Subscription): PortalSubscription {
  const item = sub.items.data[0];
  const price = item?.price;
  const product = price?.product;
  const productName =
    typeof product === "string"
      ? null
      : product && !("deleted" in product && product.deleted)
        ? product.name
        : null;

  return {
    id: sub.id,
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    paused: Boolean(sub.pause_collection),
    currentPeriodEnd: item?.current_period_end ?? null,
    created: sub.created,
    currency: price?.currency ?? sub.currency ?? null,
    amount: price?.unit_amount ?? null,
    interval: price?.recurring?.interval ?? null,
    productName:
      productName ||
      sub.metadata?.label ||
      null,
    organisationId: orgMeta(sub.metadata),
    latestInvoiceId:
      typeof sub.latest_invoice === "string"
        ? sub.latest_invoice
        : sub.latest_invoice?.id ?? null,
    kind:
      sub.metadata?.subscription_kind === "maintenance"
        ? "maintenance"
        : "standard",
  };
}

export async function listCustomerBilling(customerId: string) {
  const stripe = await getStripe();

  // Keep portal lists small — 100×4 was slow even when Stripe is healthy.
  const [invoicesResult, chargesResult, paymentIntentsResult, subscriptionsResult] =
    await Promise.allSettled([
      stripe.invoices.list({ customer: customerId, limit: 25 }),
      stripe.charges.list({ customer: customerId, limit: 25 }),
      stripe.paymentIntents.list({ customer: customerId, limit: 25 }),
      stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 25,
        expand: ["data.items.data.price"],
      }),
    ]);

  const invoices =
    invoicesResult.status === "fulfilled"
      ? invoicesResult.value.data.map(mapInvoice)
      : [];

  const chargePayments =
    chargesResult.status === "fulfilled"
      ? chargesResult.value.data.map(mapCharge)
      : [];

  const intentPayments =
    paymentIntentsResult.status === "fulfilled"
      ? paymentIntentsResult.value.data.map((pi) => ({
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          created: pi.created,
          description: pi.description,
          receiptUrl: null as string | null,
          organisationId: orgMeta(pi.metadata),
        }))
      : [];

  // Prefer charges; add payment intents that aren't already represented by charge ids.
  const paymentIds = new Set(chargePayments.map((payment) => payment.id));
  const payments = [
    ...chargePayments,
    ...intentPayments.filter((payment) => !paymentIds.has(payment.id)),
  ].sort((a, b) => b.created - a.created);

  const subscriptions =
    subscriptionsResult.status === "fulfilled"
      ? await hydrateSubscriptionNames(
          stripe,
          subscriptionsResult.value.data.map(mapSubscription),
          subscriptionsResult.value.data,
        )
      : [];

  const errors = [
    invoicesResult,
    chargesResult,
    paymentIntentsResult,
    subscriptionsResult,
  ]
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) =>
      result.reason instanceof Error
        ? result.reason.message
        : "Stripe request failed.",
    );

  return {
    invoices,
    payments,
    subscriptions,
    error: errors.length > 0 ? errors[0] : null,
  };
}

async function hydrateSubscriptionNames(
  stripe: Stripe,
  mapped: PortalSubscription[],
  raw: Stripe.Subscription[],
) {
  const missing = new Map<string, string>();
  for (let index = 0; index < mapped.length; index += 1) {
    if (mapped[index].productName) continue;
    const product = raw[index]?.items.data[0]?.price?.product;
    if (typeof product === "string" && product) {
      missing.set(mapped[index].id, product);
    }
  }

  if (missing.size === 0) return mapped;

  const uniqueProductIds = [...new Set(missing.values())];
  const products = await Promise.all(
    uniqueProductIds.map(async (productId) => {
      try {
        const product = await stripe.products.retrieve(productId);
        return [productId, product.deleted ? null : product.name] as const;
      } catch {
        return [productId, null] as const;
      }
    }),
  );
  const names = new Map(products);

  return mapped.map((subscription) => {
    if (subscription.productName) return subscription;
    const productId = missing.get(subscription.id);
    if (!productId) return subscription;
    return {
      ...subscription,
      productName: names.get(productId) ?? null,
    };
  });
}

async function publishInvoice(
  stripe: Awaited<ReturnType<typeof getStripe>>,
  invoiceId: string,
  options?: {
    organisationId?: number;
    description?: string;
  },
) {
  let invoice = await stripe.invoices.retrieve(invoiceId);

  if ("deleted" in invoice && invoice.deleted) {
    throw new Error("That invoice was deleted in Stripe.");
  }

  const metadata: Stripe.MetadataParam = {
    ...invoice.metadata,
  };
  if (options?.organisationId) {
    metadata.organisation_id = String(options.organisationId);
  }
  if (options?.description) {
    metadata.label = options.description;
  }

  const description = options?.description?.trim();
  invoice = await stripe.invoices.update(invoice.id, {
    metadata,
    ...(description && !invoice.description ? { description } : {}),
    auto_advance: true,
  });

  if (invoice.status === "draft") {
    invoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: true,
    });
  }

  // send_invoice drafts become open after finalize; explicitly send so they
  // leave draft/unpublished state even if Dashboard auto-email is off.
  if (
    invoice.status === "open" &&
    invoice.collection_method === "send_invoice"
  ) {
    try {
      invoice = await stripe.invoices.sendInvoice(invoice.id);
    } catch (error) {
      // Already emailed / not eligible to send again — keep the open invoice.
      const message = stripeErrorMessage(error).toLowerCase();
      if (
        !message.includes("already") &&
        !message.includes("sent") &&
        !message.includes("not open")
      ) {
        throw error;
      }
    }
  }

  if (invoice.status === "draft") {
    throw new Error(
      "Stripe left the invoice as a draft. Check tax/address details on the customer, then finalize it in Stripe.",
    );
  }

  return invoice;
}

async function finalizeSubscriptionInvoice(
  stripe: Awaited<ReturnType<typeof getStripe>>,
  subscription: Stripe.Subscription,
  organisationId: number,
  description: string,
) {
  const latestId =
    typeof subscription.latest_invoice === "string"
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;

  if (!latestId) {
    return null;
  }

  const invoice = await publishInvoice(stripe, latestId, {
    organisationId,
    description,
  });

  await upsertStripeOrgAssignment({
    organisationId,
    stripeObjectId: invoice.id,
    stripeObjectType: "invoice",
    label: description,
  });

  return mapInvoice(invoice);
}

export async function createOrgInvoice(input: {
  customerId: string;
  organisationId: number;
  amountPence: number;
  currency: string;
  description: string;
  daysUntilDue?: number;
}) {
  if (!Number.isFinite(input.amountPence) || input.amountPence < 1) {
    throw new Error("Enter an amount of at least 1p.");
  }

  const stripe = await getStripe();
  const currency = (input.currency || "gbp").toLowerCase();
  const description = input.description.trim() || "Invoice";

  await stripe.invoiceItems.create({
    customer: input.customerId,
    amount: Math.round(input.amountPence),
    currency,
    description,
  });

  const draft = await stripe.invoices.create({
    customer: input.customerId,
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue ?? 14,
    description,
    metadata: {
      organisation_id: String(input.organisationId),
      label: description,
    },
    auto_advance: true,
  });

  const finalized = await publishInvoice(stripe, draft.id, {
    organisationId: input.organisationId,
    description,
  });

  await upsertStripeOrgAssignment({
    organisationId: input.organisationId,
    stripeObjectId: finalized.id,
    stripeObjectType: "invoice",
    label: description,
  });

  return mapInvoice(finalized);
}

export async function createOrgSubscription(input: {
  customerId: string;
  organisationId: number;
  amountPence: number;
  currency: string;
  description: string;
  interval: "month" | "year" | "week";
  daysUntilDue?: number;
  kind?: "standard" | "maintenance";
}) {
  if (!Number.isFinite(input.amountPence) || input.amountPence < 1) {
    throw new Error("Enter an amount of at least 1p.");
  }

  const stripe = await getStripe();
  const currency = (input.currency || "gbp").toLowerCase();
  const kind = input.kind === "maintenance" ? "maintenance" : "standard";
  const description =
    input.description.trim() ||
    (kind === "maintenance" ? "Website maintenance" : "Subscription");

  const product = await stripe.products.create({
    name: description,
    tax_code: WEB_DEVELOPMENT_TAX_CODE,
    metadata: {
      organisation_id: String(input.organisationId),
      subscription_kind: kind,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: input.customerId,
    items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(input.amountPence),
          recurring: { interval: input.interval },
          product: product.id,
          tax_behavior: "exclusive",
        },
      },
    ],
    automatic_tax: { enabled: true },
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue ?? 14,
    metadata: {
      organisation_id: String(input.organisationId),
      label: description,
      subscription_kind: kind,
    },
    expand: ["latest_invoice", "items.data.price.product"],
  });

  await upsertStripeOrgAssignment({
    organisationId: input.organisationId,
    stripeObjectId: subscription.id,
    stripeObjectType: "subscription",
    label: description,
  });

  const firstInvoice = await finalizeSubscriptionInvoice(
    stripe,
    subscription,
    input.organisationId,
    description,
  );

  if (!firstInvoice) {
    throw new Error(
      "Subscription created, but Stripe did not attach a first invoice to publish.",
    );
  }
  if (firstInvoice.status === "draft") {
    throw new Error(
      "Subscription created, but the first invoice is still a draft. Check the customer’s billing address/tax details in Stripe.",
    );
  }

  return {
    subscription: mapSubscription(subscription),
    invoice: firstInvoice,
  };
}

export async function assignStripeObjectToOrg(input: {
  organisationId: number;
  stripeObjectId: string;
}) {
  const id = input.stripeObjectId.trim();
  const stripe = await getStripe();

  if (id.startsWith("in_")) {
    const invoice = await stripe.invoices.update(id, {
      metadata: { organisation_id: String(input.organisationId) },
    });
    await upsertStripeOrgAssignment({
      organisationId: input.organisationId,
      stripeObjectId: id,
      stripeObjectType: "invoice",
      label: invoice.description || invoice.number,
    });
    return { type: "invoice" as const, id };
  }

  if (id.startsWith("sub_")) {
    const sub = await stripe.subscriptions.update(id, {
      metadata: { organisation_id: String(input.organisationId) },
    });
    await upsertStripeOrgAssignment({
      organisationId: input.organisationId,
      stripeObjectId: id,
      stripeObjectType: "subscription",
      label: sub.metadata?.label || null,
    });
    return { type: "subscription" as const, id };
  }

  if (id.startsWith("pi_")) {
    const pi = await stripe.paymentIntents.update(id, {
      metadata: { organisation_id: String(input.organisationId) },
    });
    await upsertStripeOrgAssignment({
      organisationId: input.organisationId,
      stripeObjectId: id,
      stripeObjectType: "payment_intent",
      label: pi.description || null,
    });
    return { type: "payment_intent" as const, id };
  }

  if (id.startsWith("ch_")) {
    const charge = await stripe.charges.update(id, {
      metadata: { organisation_id: String(input.organisationId) },
    });
    await upsertStripeOrgAssignment({
      organisationId: input.organisationId,
      stripeObjectId: id,
      stripeObjectType: "charge",
      label: charge.description || null,
    });
    return { type: "charge" as const, id };
  }

  throw new Error(
    "Enter an invoice (in_), subscription (sub_), payment intent (pi_), or charge (ch_) id.",
  );
}

export async function cancelOrgSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean,
) {
  const stripe = await getStripe();
  if (atPeriodEnd) {
    return mapSubscription(
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      }),
    );
  }
  return mapSubscription(await stripe.subscriptions.cancel(subscriptionId));
}

export async function pauseOrgSubscription(subscriptionId: string) {
  const stripe = await getStripe();
  return mapSubscription(
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: "mark_uncollectible" },
    }),
  );
}

export async function resumeOrgSubscription(subscriptionId: string) {
  const stripe = await getStripe();
  return mapSubscription(
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: "",
      cancel_at_period_end: false,
    }),
  );
}

export async function loadAssignedOrgBilling(
  organisationId: number,
  memberCustomerIds: string[] = [],
) {
  const { listOrgStripeAssignments } = await import("@/lib/stripe/store");
  const assignments = await listOrgStripeAssignments(organisationId);
  const stripe = await getStripe();
  const orgKey = String(organisationId);

  const invoices = new Map<string, PortalInvoice>();
  const payments = new Map<string, PortalPayment>();
  const subscriptions = new Map<string, PortalSubscription>();

  async function loadSubscription(id: string) {
    try {
      const sub = await stripe.subscriptions.retrieve(id, {
        expand: ["items.data.price.product", "latest_invoice"],
      });
      subscriptions.set(sub.id, mapSubscription(sub));
      const latest = sub.latest_invoice;
      if (latest && typeof latest !== "string") {
        invoices.set(latest.id, mapInvoice(latest));
      } else if (typeof latest === "string") {
        try {
          const invoice = await stripe.invoices.retrieve(latest);
          invoices.set(invoice.id, mapInvoice(invoice));
        } catch {
          // Invoice may have been deleted.
        }
      }
    } catch {
      try {
        const sub = await stripe.subscriptions.retrieve(id);
        subscriptions.set(sub.id, mapSubscription(sub));
      } catch {
        // Deleted in Stripe.
      }
    }
  }

  async function loadInvoicesForSubscription(subscriptionId: string) {
    try {
      const listed = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 25,
      });
      for (const invoice of listed.data) {
        invoices.set(invoice.id, mapInvoice(invoice));
      }
    } catch {
      // Subscription may be gone or invoices unavailable.
    }
  }

  // Assignments first (usually few objects), then member customers in parallel.
  await Promise.all(
    assignments.map(async (row) => {
      try {
        if (row.stripe_object_type === "invoice") {
          const invoice = await stripe.invoices.retrieve(row.stripe_object_id);
          invoices.set(invoice.id, mapInvoice(invoice));
        } else if (row.stripe_object_type === "subscription") {
          await loadSubscription(row.stripe_object_id);
        } else if (row.stripe_object_type === "charge") {
          const charge = await stripe.charges.retrieve(row.stripe_object_id);
          payments.set(charge.id, mapCharge(charge));
        } else if (row.stripe_object_type === "payment_intent") {
          const pi = await stripe.paymentIntents.retrieve(row.stripe_object_id);
          payments.set(pi.id, {
            id: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            status: pi.status,
            created: pi.created,
            description: pi.description,
            receiptUrl: null,
            organisationId: orgMeta(pi.metadata),
          });
        }
      } catch {
        // Object may have been deleted in Stripe — skip.
      }
    }),
  );

  const uniqueCustomers = [...new Set(memberCustomerIds.filter(Boolean))];
  await Promise.all(
    uniqueCustomers.map(async (customerId) => {
      const billing = await listCustomerBilling(customerId);
      for (const invoice of billing.invoices) {
        if (
          invoice.organisationId === orgKey ||
          assignments.some((row) => row.stripe_object_id === invoice.id)
        ) {
          invoices.set(invoice.id, invoice);
        }
      }
      for (const payment of billing.payments) {
        if (
          payment.organisationId === orgKey ||
          assignments.some((row) => row.stripe_object_id === payment.id)
        ) {
          payments.set(payment.id, payment);
        }
      }
      for (const subscription of billing.subscriptions) {
        if (
          subscription.organisationId === orgKey ||
          assignments.some((row) => row.stripe_object_id === subscription.id)
        ) {
          subscriptions.set(subscription.id, subscription);
        }
      }
    }),
  );

  // Pull every invoice that belongs to an organisation subscription
  // (first invoice, renewals, and any not yet assigned by id).
  await Promise.all(
    [...subscriptions.keys()].map((subscriptionId) =>
      loadInvoicesForSubscription(subscriptionId),
    ),
  );

  const sortByCreated = <T extends { created: number }>(items: T[]) =>
    [...items].sort((a, b) => b.created - a.created);

  return {
    invoices: sortByCreated([...invoices.values()]),
    payments: sortByCreated([...payments.values()]),
    subscriptions: sortByCreated([...subscriptions.values()]),
    assignments,
  };
}

export { stripeErrorMessage };
