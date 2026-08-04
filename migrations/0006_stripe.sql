-- Stripe customer link on portal users
ALTER TABLE client_users ADD COLUMN stripe_customer_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_users_stripe_customer
  ON client_users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Map Stripe invoices / subscriptions / payments to organisations
CREATE TABLE IF NOT EXISTS stripe_org_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organisation_id INTEGER NOT NULL REFERENCES client_organisations(id) ON DELETE CASCADE,
  stripe_object_id TEXT NOT NULL UNIQUE,
  stripe_object_type TEXT NOT NULL CHECK (
    stripe_object_type IN ('invoice', 'subscription', 'payment_intent', 'charge')
  ),
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stripe_org_assignments_org
  ON stripe_org_assignments(organisation_id);
