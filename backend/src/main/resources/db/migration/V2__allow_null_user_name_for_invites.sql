-- Invited administration workers are created before they choose a display name.
-- The registration flow fills in users.name later, so the column must allow nulls.
ALTER TABLE users
    ALTER COLUMN name DROP NOT NULL;
