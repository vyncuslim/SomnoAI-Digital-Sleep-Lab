
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

-- 2. User Biological Metrics
CREATE TABLE IF NOT EXISTS public.user_data (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    age integer,
    weight decimal,
    height decimal,
    gender text,
    updated_at timestamptz DEFAULT now()
);

-- 3. Feedback System (Fixes "type" column error)
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
-- ANALYTICS & MONITORING (DECISION CENTER)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.analytics_daily (
    date date PRIMARY KEY,
    users integer DEFAULT 0,
    sessions integer DEFAULT 0,
    pageviews integer DEFAULT 0,
    distribution jsonb DEFAULT '{"device": {"mobile": 0, "desktop": 0}, "source": {"direct": 0, "google": 0}}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_country (
    id bigserial PRIMARY KEY,
    date date NOT NULL,
    country text NOT NULL,
    users integer DEFAULT 0,
    UNIQUE(date, country)
);

CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    id bigserial PRIMARY KEY,
    timestamp timestamptz DEFAULT now(),
    active_users integer DEFAULT 0,
    sessions_last_hour integer DEFAULT 0,
    pageviews_last_hour integer DEFAULT 0
);

-- ==========================================
-- SECURITY & ACCESS POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;

-- Analytics: Admins Only
CREATE POLICY "Admins can view analytics" ON public.analytics_daily FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Feedback: Public Insert, Admin Read
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view feedback" ON public.feedback FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Diary: Owner Read/Write
CREATE POLICY "Users can manage own diary" ON public.diary_entries 
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- ADMIN RPC LAYER
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text
    FROM public.profiles p JOIN auth.users au ON p.id = au.id WHERE p.id = auth.uid();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text, updated_at timestamptz) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE'; END IF;
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text, p.updated_at
    FROM public.profiles p JOIN auth.users au ON p.id = au.id ORDER BY p.updated_at DESC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'CLEARANCE_DENIED'; END IF;
    IF auth.uid() = target_user_id THEN RAISE EXCEPTION 'SELF_BLOCK_PROHIBITED'; END IF;
    UPDATE public.profiles SET is_blocked = NOT is_blocked WHERE id = target_user_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
