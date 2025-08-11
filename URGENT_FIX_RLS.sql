-- IMMEDIATE FIX: Run this in your Supabase SQL Editor to fix the RLS policy issue
-- This will allow authenticated users to insert/update their own profile data

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 2: Create a comprehensive policy that allows all operations for own data
CREATE POLICY "users_all_operations" ON users
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Also create a temporary bypass for testing (remove after testing)
-- This allows any authenticated user to insert data temporarily
CREATE POLICY "temp_insert_for_testing" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Alternative: If above doesn't work, temporarily disable RLS for testing
-- Uncomment the line below to disable RLS completely (ONLY for testing)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
