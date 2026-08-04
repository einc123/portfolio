-- User billing details for client portal profile

ALTER TABLE client_users ADD COLUMN billing_name TEXT;
ALTER TABLE client_users ADD COLUMN billing_line1 TEXT;
ALTER TABLE client_users ADD COLUMN billing_line2 TEXT;
ALTER TABLE client_users ADD COLUMN billing_city TEXT;
ALTER TABLE client_users ADD COLUMN billing_postcode TEXT;
ALTER TABLE client_users ADD COLUMN billing_country TEXT;
ALTER TABLE client_users ADD COLUMN billing_phone TEXT;
