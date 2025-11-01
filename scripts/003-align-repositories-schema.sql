-- Align repositories table with application expectations
ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Backfill github_url for existing rows before enforcing NOT NULL
UPDATE repositories
SET github_url = CONCAT('https://github.com/', owner, '/', name)
WHERE github_url IS NULL;

ALTER TABLE repositories
  ALTER COLUMN github_url SET NOT NULL;

ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS greptile_repository_id TEXT;

ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS indexing_status TEXT;

ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS status_endpoint TEXT;

ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Ensure branch has the expected default and non-null constraint
UPDATE repositories
SET branch = 'main'
WHERE branch IS NULL;

ALTER TABLE repositories
  ALTER COLUMN branch SET DEFAULT 'main',
  ALTER COLUMN branch SET NOT NULL;

-- Ensure is_indexed default aligns with application logic
UPDATE repositories
SET is_indexed = FALSE
WHERE is_indexed IS NULL;

ALTER TABLE repositories
  ALTER COLUMN is_indexed SET DEFAULT FALSE,
  ALTER COLUMN is_indexed SET NOT NULL;
