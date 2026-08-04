-- Contract templates (editable) and organisation contract instances

CREATE TABLE IF NOT EXISTS contract_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_html TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organisation_contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organisation_id INTEGER NOT NULL REFERENCES client_organisations(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES contract_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'voided')),
  content_hash TEXT NOT NULL,
  sent_at TEXT,
  sent_by_user_id INTEGER REFERENCES client_users(id) ON DELETE SET NULL,
  signed_at TEXT,
  signer_user_id INTEGER REFERENCES client_users(id) ON DELETE SET NULL,
  signer_name TEXT,
  signer_email TEXT,
  signature_data TEXT,
  signature_type TEXT CHECK (signature_type IS NULL OR signature_type IN ('typed', 'drawn')),
  signed_payload_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_organisation_contracts_org
  ON organisation_contracts(organisation_id);

CREATE INDEX IF NOT EXISTS idx_organisation_contracts_status
  ON organisation_contracts(status);
