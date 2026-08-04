-- Public live website URL for the organisation (distinct from hosting control-panel URL)

ALTER TABLE client_organisations ADD COLUMN website_url TEXT;
