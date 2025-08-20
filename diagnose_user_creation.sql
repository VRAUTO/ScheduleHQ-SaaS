-- Diagnose and fix the user creation issue
-- Run this in Supabase SQL Editor to check and fix the user creation trigger

-- 1. Check if the user exists in auth.users but not in your users table
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  u.id as user_id,
  u.email as user_email,
  u.profile_complete
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.id = '3b72d52e-713d-43df-ad78-a6e215def473'
   OR u.id = '3b72d52e-713d-43df-ad78-a6e215def473';

-- 2. If the user exists in auth.users but not in public.users, create them manually
-- Replace the ID with the actual ID from the error
INSERT INTO public.users (id, email, name, profile_complete, complete_role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  false,
  false,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = '3b72d52e-713d-43df-ad78-a6e215def473'
AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);

-- 3. Check if the trigger function exists and is working
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.trigger_schema,
  t.trigger_catalog
FROM information_schema.triggers t
WHERE t.event_object_table = 'users' 
   AND t.event_object_schema = 'auth';

-- 4. Recreate the trigger if it's missing
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, profile_complete, complete_role, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    FALSE,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
