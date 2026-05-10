-- Remove restrictive policies from profiles and user_roles tables
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Staff view all roles" ON public.user_roles;

-- Add public full access policies to profiles
CREATE POLICY "Public full access" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Add public full access policies to user_roles
CREATE POLICY "Public full access" ON public.user_roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);