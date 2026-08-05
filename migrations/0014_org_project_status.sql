-- Current project phase for each organisation (planning → launch).

ALTER TABLE client_organisations
  ADD COLUMN project_status TEXT NOT NULL DEFAULT 'planning';
