-- Per-user appearance preferences (light/dark + accent)

ALTER TABLE client_users ADD COLUMN preferred_theme TEXT;
ALTER TABLE client_users ADD COLUMN preferred_accent TEXT;
