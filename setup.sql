-- ==========================================
-- SOMNOAI SYSTEM RECOVERY & CALIBRATION
-- ==========================================

-- 1. STALE TRIGGER CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. RESOLVE 42P16 VIEW/TABLE CONFLICTS
-- Some Supabase templates create 'profiles' as a view. We need a physical table.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP TABLE public.profiles CASCADE;
    ELSIF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP VIEW public.profiles CASCADE;
    END IF;
END $$;

-- 3. CORE IDENTITY REGISTRY
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user',
    full_name text DEFAULT '',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. BIOMETRIC DATA STORE
CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age integer,
    weight float,
    height float,
    gender text,
    created_at timestamptz DEFAULT now()
);

-- 5. TELEMETRY INGRESS
CREATE TABLE IF NOT EXISTS public.health_raw_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type text NOT NULL,
    recorded_at timestamptz DEFAULT now(),
    source text,
    value jsonb,
    created_at timestamptz DEFAULT now()
);

-- 6. FEEDBACK REGISTRY
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    feedback_type text,
    content text,
    created_at timestamptz DEFAULT now()
);

-- 7. RECURSION-SAFE ADMIN CHECK
-- SECURITY DEFINER allows the function to bypass RLS policies on the table it queries.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RESILIENT AUTH TRIGGER
-- Ensures a profile is always created regardless of auth provider metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles: user access" ON public.profiles;
CREATE POLICY "Profiles: user access" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: admin access" ON public.profiles;
CREATE POLICY "Profiles: admin access" ON public.profiles 
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Profiles: self update" ON public.profiles;
CREATE POLICY "Profiles: self update" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Data Policies
DROP POLICY IF EXISTS "UserData: self access" ON public.user_data;
CREATE POLICY "UserData: self access" ON public.user_data 
FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "HealthData: owner access" ON public.health_raw_data;
CREATE POLICY "HealthData: owner access" ON public.health_raw_data 
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Feedback: public insert" ON public.feedback;
CREATE POLICY "Feedback: public insert" ON public.feedback 
FOR INSERT WITH CHECK (true);

-- 10. GLOBAL PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 11. REFRESH
NOTIFY pgrst, 'reload schema';