-- Bundled / already-paid maintenance plan (not a Stripe subscription).
-- Amount is required when enabled so the plan is never presented as free.

ALTER TABLE client_organisations ADD COLUMN maintenance_included INTEGER NOT NULL DEFAULT 0;
ALTER TABLE client_organisations ADD COLUMN maintenance_included_amount_pence INTEGER;
ALTER TABLE client_organisations ADD COLUMN maintenance_included_interval TEXT;
