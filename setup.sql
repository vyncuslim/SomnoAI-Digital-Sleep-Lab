-- ==========================================
-- SOMNOAI TOTAL SYSTEM INITIALIZATION
-- ==========================================

-- 1. CLEANUP PREVIOUS CONFLICTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. ENSURE PROFILES TABLE (CORE)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'profiles') THEN
        DROP VIEW public.profiles CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user',
    full_name text DEFAULT '',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. USER BIOMETRICS TABLE
CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age integer,
    weight float,
    height float,
    gender text,
    created_at timestamptz DEFAULT now()
);

-- 4. HEALTH DATA (TELEMETRY)
CREATE TABLE IF NOT EXISTS public.health_raw_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type text NOT NULL,
    recorded_at timestamptz DEFAULT now(),
    source text,
    value jsonb,
    created_at timestamptz DEFAULT now()
);

-- 5. FEEDBACK & SECURITY TABLES
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    feedback_type text,
    content text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    event_type text,
    event_reason text,
    notified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    ip_address text,
    status text,
    attempt_at timestamptz DEFAULT now()
);

-- 6. SECURITY HELPER FUNCTIONS
-- Using SECURITY DEFINER to bypass RLS check for the table itself (prevents infinite loop)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. AUTH TRIGGER (FIXES "DATABASE ERROR SAVING USER")
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles: users see own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: admins see all" ON public.profiles FOR ALL USING (public.is_admin());

-- Data Policies
CREATE POLICY "Data: users see own" ON public.user_data FOR ALL USING (auth.uid() = id);
CREATE POLICY "Health: users manage own" ON public.health_raw_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Feedback: anyone can insert" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Security: admin only" ON public.security_events FOR ALL USING (public.is_admin());

-- 9. GLOBAL GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 10. REFRESH CACHE
NOTIFY pgrst, 'reload schema';