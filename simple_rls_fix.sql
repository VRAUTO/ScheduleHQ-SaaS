-- Simple fix for RLS policy violation
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS to test
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or, fix the policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable insert access for users to own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON users;

-- Create a more permissive insert policy for authenticated users
CREATE POLICY "Allow authenticated users to insert their own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- Alternative: Allow any authenticated user to insert/upsert their profile
CREATE POLICY "Allow authenticated users to upsert profiles" ON users
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Make sure the function that creates users automatically has the right permissions
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
