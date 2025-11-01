-- Ensure repositories.user_id references auth.users(id)
ALTER TABLE repositories
  DROP CONSTRAINT IF EXISTS repositories_user_id_fkey;

ALTER TABLE repositories
  ADD CONSTRAINT repositories_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
