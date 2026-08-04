-- Unmanaged hosting provider + resolved hosting URL
ALTER TABLE client_organisations ADD COLUMN unmanaged_provider TEXT;
ALTER TABLE client_organisations ADD COLUMN hosting_url TEXT;
