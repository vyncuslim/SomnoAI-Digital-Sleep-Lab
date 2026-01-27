-- ==========================================
-- SOMNOAI TOTAL SYSTEM CALIBRATION (V22.0)
-- Fixes 400 (Missing Columns) & 500 (RLS Loop)
-- ==========================================

-- 1. CREATE TABLES WITH ALL REQUIRED COLUMNS
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'user',
    email text,
    full_name text,
    is_blocked boolean DEFAULT false,
    is_initialized boolean DEFAULT false,
    has_app_data boolean DEFAULT false
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

-- 2. FORCE ADD COLUMNS TO EXISTING TABLES (IF THEY ALREADY EXISTED)
DO $$ 
BEGIN 
    -- Profiles Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_initialized') THEN
        ALTER TABLE public.profiles ADD COLUMN is_initialized boolean DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='has_app_data') THEN
        ALTER TABLE public.profiles ADD COLUMN has_app_data boolean DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_blocked') THEN
        ALTER TABLE public.profiles ADD COLUMN is_blocked boolean DEFAULT false;
    END IF;
    
    -- User Data Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='age') THEN
        ALTER TABLE public.user_data ADD COLUMN age integer;
    END IF;
END $$;

-- 3. RECURSION-PROOF ADMIN FUNCTION
-- This function bypasses RLS to check roles safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. RESET AND APPLY RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies
DROP POLICY IF EXISTS "profiles_access_v21" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_v21" ON public.profiles;
DROP POLICY IF EXISTS "user_data_all_v21" ON public.user_data;
DROP POLICY IF EXISTS "health_data_all_v21" ON public.health_raw_data;

-- New robust policies
CREATE POLICY "profiles_read_policy" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_write_policy" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "user_data_policy" ON public.user_data FOR ALL USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "health_data_policy" ON public.health_raw_data FOR ALL USING (auth.uid() = id OR public.is_admin());

-- 5. RELOAD API CACHE
NOTIFY pgrst, 'reload schema';