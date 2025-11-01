-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Repositories table policies
-- Users can read their own repositories
CREATE POLICY "Users can read own repositories"
  ON repositories
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own repositories
CREATE POLICY "Users can insert own repositories"
  ON repositories
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own repositories
CREATE POLICY "Users can update own repositories"
  ON repositories
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own repositories
CREATE POLICY "Users can delete own repositories"
  ON repositories
  FOR DELETE
  USING (auth.uid()::text = user_id::text);
