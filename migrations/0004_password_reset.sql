-- Password reset + forced change on first login

ALTER TABLE client_users ADD COLUMN must_reset_password INTEGER NOT NULL DEFAULT 0;
ALTER TABLE client_users ADD COLUMN password_reset_token TEXT;
ALTER TABLE client_users ADD COLUMN password_reset_expires_at TEXT;
