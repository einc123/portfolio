-- Case studies linked 1:1 to organisations. Presence of a row = show on portfolio.

CREATE TABLE IF NOT EXISTS organisation_case_studies (
  organisation_id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  logo TEXT NOT NULL,
  logo_light INTEGER NOT NULL DEFAULT 0,
  services_json TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  overview TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  design_tools_json TEXT NOT NULL DEFAULT '[]',
  stack_json TEXT NOT NULL DEFAULT '[]',
  colours_json TEXT NOT NULL DEFAULT '[]',
  highlights_json TEXT,
  year TEXT NOT NULL DEFAULT '',
  seo_title TEXT,
  seo_description TEXT,
  seo_headline TEXT,
  show_on_local INTEGER NOT NULL DEFAULT 0,
  show_on_charity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organisation_id) REFERENCES client_organisations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_studies_featured
  ON organisation_case_studies(featured);

CREATE INDEX IF NOT EXISTS idx_case_studies_local
  ON organisation_case_studies(show_on_local);

CREATE INDEX IF NOT EXISTS idx_case_studies_charity
  ON organisation_case_studies(show_on_charity);
