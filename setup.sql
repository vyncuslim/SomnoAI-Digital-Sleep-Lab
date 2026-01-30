
-- ==========================================
-- SOMNOAI CORE INFRASTRUCTURE
-- ==========================================

-- 1. Profiles (Extended User Data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role text DEFAULT 'user',
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    full_name text,
    updated_at timestamptz DEFAULT now()
);

-- 2. Biological Metrics
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    age integer,
    weight decimal,
    height decimal,
    gender text,
    updated_at timestamptz DEFAULT now()
);

-- 3. Feedback System
CREATE TABLE IF NOT EXISTS public.feedback (
    id bigserial PRIMARY KEY,
    type text NOT NULL, -- 'report', 'suggestion', 'improvement'
    content text NOT NULL,
    email text,
    created_at timestamptz DEFAULT now()
);

-- 4. Biological Recovery Logs (Diary)
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    mood text,
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- AUTOMATIC PROFILE SYNC (CRITICAL)
-- This ensures every Auth user has a corresponding row in public.profiles
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN (SELECT count(*) FROM public.profiles) = 0 THEN 'owner' -- First user is always Owner
      ELSE 'user' 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ANALYTICS TABLES (GA4 SYNC TARGETS)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.analytics_daily (
    date date PRIMARY KEY,
    users integer DEFAULT 0,
    sessions integer DEFAULT 0,
    pageviews integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_country (
    id bigserial PRIMARY KEY,
    date date NOT NULL,
    country text NOT NULL,
    users integer DEFAULT 0,
    UNIQUE(date, country)
);

CREATE TABLE IF NOT EXISTS public.analytics_device (
    id bigserial PRIMARY KEY,
    date date NOT NULL,
    device text NOT NULL,
    users integer DEFAULT 0,
    UNIQUE(date, device)
);

CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    id bigserial PRIMARY KEY,
    timestamp timestamptz DEFAULT now(),
    active_users integer DEFAULT 0,
    sessions_last_hour integer DEFAULT 0
);

-- ==========================================
-- RPC FUNCTIONS (CRITICAL FOR ADMIN PANEL)
-- ==========================================

-- 1. Get Detailed Profile (Auth check)
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text
    FROM public.profiles p JOIN auth.users au ON p.id = au.id WHERE p.id = auth.uid();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get All Profiles (Admin Registry)
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text, updated_at timestamptz) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE'; END IF;
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text, p.updated_at
    FROM public.profiles p JOIN auth.users au ON p.id = au.id ORDER BY p.updated_at DESC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Toggle Block Status
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'CLEARANCE_DENIED'; END IF;
    IF auth.uid() = target_user_id THEN RAISE EXCEPTION 'SELF_BLOCK_PROHIBITED'; END IF;
    UPDATE public.profiles SET is_blocked = NOT is_blocked WHERE id = target_user_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update User Role (Clearance Override)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'owner' OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'OWNER_CLEARANCE_REQUIRED'; END IF;
    IF auth.uid() = target_user_id THEN RAISE EXCEPTION 'SELF_EDIT_PROHIBITED'; END IF;
    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- SECURITY POLICIES (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_device ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view daily analytics" ON public.analytics_daily FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view geo analytics" ON public.analytics_country FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view device analytics" ON public.analytics_device FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));
