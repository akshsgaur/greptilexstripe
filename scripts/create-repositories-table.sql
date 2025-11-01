CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  description TEXT,
  github_url TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  is_indexed BOOLEAN NOT NULL DEFAULT false,
  indexing_status TEXT,
  status_endpoint TEXT,
  stripe_payment_id TEXT,
  greptile_repository_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, full_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_repositories_is_indexed ON repositories(is_indexed);
CREATE INDEX IF NOT EXISTS idx_repositories_full_name ON repositories(full_name);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own repositories"
  ON repositories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repositories"
  ON repositories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories"
  ON repositories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repositories"
  ON repositories FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
