import { BillingRequiredModal } from "@/components/client/BillingRequiredModal";
import { ForcePasswordResetModal } from "@/components/client/ForcePasswordResetModal";
import { PaymentMethodRequiredModal } from "@/components/client/PaymentMethodRequiredModal";
import {
  readSession,
  requireOrganisationMembership,
} from "@/lib/auth/session";
import { findUserById, userHasBillingDetails } from "@/lib/auth/users";
import {
  customerHasDefaultPaymentMethod,
  ensureStripeCustomerForUser,
} from "@/lib/stripe/billing";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let forcePasswordModal: React.ReactNode = null;
  let billingModal: React.ReactNode = null;
  let paymentMethodModal: React.ReactNode = null;

  try {
    const session = await readSession();
    if (session && !session.pending2fa) {
      const user = await findUserById(session.userId);
      if (user?.must_reset_password) {
        forcePasswordModal = <ForcePasswordResetModal />;
      } else {
        const active = await requireOrganisationMembership(session);
        if (active && user) {
          if (!userHasBillingDetails(user)) {
            billingModal = (
              <BillingRequiredModal
                defaults={{
                  billingName:
                    user.billing_name?.trim() || user.full_name?.trim() || "",
                  line1: user.billing_line1?.trim() || "",
                  line2: user.billing_line2?.trim() || "",
                  city: user.billing_city?.trim() || "",
                  postcode: user.billing_postcode?.trim() || "",
                  country: user.billing_country?.trim() || "United Kingdom",
                  phone: user.billing_phone?.trim() || "",
                }}
              />
            );
          } else {
            try {
              const customerId = await ensureStripeCustomerForUser(user);
              const hasCard =
                await customerHasDefaultPaymentMethod(customerId);
              if (!hasCard) {
                paymentMethodModal = <PaymentMethodRequiredModal />;
              }
            } catch {
              // Don't lock the portal if Stripe is temporarily unreachable.
            }
          }
        }
      }
    }
  } catch {
    forcePasswordModal = null;
    billingModal = null;
    paymentMethodModal = null;
  }

  return (
    <div className="min-h-[calc(100svh-5rem)]">
      <div className="page-pad mx-auto w-full max-w-5xl pb-16 pt-6 sm:pt-8">
        {children}
      </div>
      {forcePasswordModal}
      {billingModal}
      {paymentMethodModal}
    </div>
  );
}
