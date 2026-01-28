
-- ==========================================
-- SOMNOAI SYSTEM RECOVERY & CALIBRATION
-- ==========================================

-- 1. STALE TRIGGER CLEANUP
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. RESOLVE 42P16 VIEW/TABLE CONFLICTS
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
    avatar_url text DEFAULT '',
    provider text DEFAULT 'email',
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

-- 6. DIARY REGISTRY (NEW)
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    mood text,
    created_at timestamptz DEFAULT now()
);

-- 7. FEEDBACK REGISTRY
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    feedback_type text,
    content text,
    created_at timestamptz DEFAULT now()
);

-- 8. RECURSION-SAFE ADMIN CHECK
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ENRICHED AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    full_name, 
    avatar_url, 
    provider
  )
  VALUES (
    new.id, 
    new.email, 
    'user', 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    new.app_metadata->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles: user read own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: user update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Data Policies
CREATE POLICY "User Data: access own" ON public.user_data FOR ALL USING (auth.uid() = id);

-- Diary Policies
CREATE POLICY "Diary: user access" ON public.diary_entries 
FOR ALL USING (auth.uid() = user_id);

-- 11. GLOBAL PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 12. REFRESH
NOTIFY pgrst, 'reload schema';
