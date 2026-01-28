
-- ==========================================
-- SOMNOAI QUANTUM INFRASTRUCTURE (v3.0)
-- ROLE HIERARCHY: owner > admin > user
-- ==========================================

-- 1. CLEANUP & INITIALIZATION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. CORE REGISTRY TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user', -- 'owner', 'admin', 'user'
    full_name text DEFAULT '',
    avatar_url text DEFAULT '',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age integer,
    weight float,
    height float,
    gender text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_raw_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type text,
    recorded_at timestamptz DEFAULT now(),
    source text,
    value jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. NEURAL IDENTITY TRIGGER (Syncs JWT app_metadata to Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_app_meta_data->>'role', 'user'), 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = COALESCE(new.raw_app_meta_data->>'role', profiles.role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ENTERPRISE RLS POLICIES (JWT-BASED / NO RECURSION)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;

-- Profiles: Hierarchy Logic
-- USER: Self only
CREATE POLICY "profiles_self_access" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- ADMIN/OWNER: Tiered visibility
CREATE POLICY "profiles_hierarchy_access" ON public.profiles
FOR ALL USING (
    auth.jwt() ->> 'role' = 'owner' OR 
    (auth.jwt() ->> 'role' = 'admin' AND role != 'owner')
);

-- User Data: Tiered visibility
CREATE POLICY "user_data_hierarchy" ON public.user_data
FOR ALL USING (
    auth.uid() = id OR
    auth.jwt() ->> 'role' = 'owner' OR 
    auth.jwt() ->> 'role' = 'admin'
);

-- Health Raw Data: Tiered visibility
CREATE POLICY "health_data_hierarchy" ON public.health_raw_data
FOR ALL USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'role' = 'owner' OR 
    auth.jwt() ->> 'role' = 'admin'
);

-- 5. ADMIN UTILITIES
CREATE OR REPLACE FUNCTION public.is_management() 
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') IN ('admin', 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GLOBAL PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

NOTIFY pgrst, 'reload schema';
