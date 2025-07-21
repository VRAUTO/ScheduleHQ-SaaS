-- Updated users table schema to include additional profile fields
-- Run this in your Supabase SQL editor

-- Add new columns to existing users table (if they don't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR,
ADD COLUMN IF NOT EXISTS company VARCHAR,
ADD COLUMN IF NOT EXISTS role VARCHAR;

-- Update the trigger function to handle new users from auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, profile_complete, created_at)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), false, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Create trigger for automatic user creation (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
