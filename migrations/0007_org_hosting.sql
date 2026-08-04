-- Organisation hosting type: managed (OVH / in-house) or unmanaged
ALTER TABLE client_organisations ADD COLUMN hosting_type TEXT NOT NULL DEFAULT 'unmanaged';
