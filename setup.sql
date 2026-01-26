-- ==========================================
-- SOMNOAI RECURSION-FREE ARCHITECTURE (V10.0)
-- ==========================================

-- 1. Table Definitions (Enforce correct structure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  is_initialized boolean DEFAULT false,
  has_app_data boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Security Function (Bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.proc_security_guard()
RETURNS TRIGGER AS $$
DECLARE
    fail_count INTEGER;
BEGIN
    SELECT count(*) INTO fail_count
    FROM public.login_attempts
    WHERE email = NEW.email
    AND success = false
    AND attempt_at > now() - interval '1 minute';

    IF fail_count >= 10 THEN
        -- Updates the table directly using SECURITY DEFINER privileges
        UPDATE public.profiles SET is_blocked = true WHERE email = NEW.email;
        
        INSERT INTO public.security_events (email, event_type, event_reason)
        VALUES (NEW.email, 'BRUTE_FORCE_DETECTED', 'Automatic lock triggered');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Policy Reset (FIX: Removing all self-referencing subqueries)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

-- Use direct comparison only. Never query 'profiles' inside its own policy.
CREATE POLICY "profiles_select_self" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 4. Health Data Policies
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "health_raw_data_self" ON public.health_raw_data;
CREATE POLICY "health_raw_data_self" ON public.health_raw_data FOR ALL TO authenticated USING (user_id = auth.uid());

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
NOTIFY pgrst, 'reload schema';