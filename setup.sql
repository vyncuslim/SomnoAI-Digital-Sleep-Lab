
-- ==========================================
-- SOMNOAI CORE ADMIN SYSTEM (RPC LAYER)
-- ==========================================

-- 1. Get Detailed Profile with Clearance Levels
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (
    id uuid,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text,
    email text
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Admin: Get All Profiles (Restricted)
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (
    id uuid,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text,
    email text,
    updated_at timestamptz
) AS $$
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    RETURN QUERY
    SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text, p.updated_at
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Admin: Toggle Block Status
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void AS $$
BEGIN
    -- Authorization Check (Only Admins/Owners)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'CLEARANCE_DENIED';
    END IF;

    -- Prevent self-blocking
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'SELF_BLOCK_PROHIBITED';
    END IF;

    -- Prevent blocking super owners
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND is_super_owner = true) THEN
        RAISE EXCEPTION 'SUPER_OWNER_IMMUNITY';
    END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Admin: Update User Role
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
    -- Authorization Check (Only Owners/Super Owners can change roles)
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'owner' OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'OWNER_CLEARANCE_REQUIRED';
    END IF;

    -- Prevent changing role of super owners
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND is_super_owner = true) THEN
        RAISE EXCEPTION 'SUPER_OWNER_IMMUNITY';
    END IF;

    -- Validate role
    IF new_role NOT IN ('user', 'admin', 'owner') THEN
        RAISE EXCEPTION 'INVALID_ROLE_SPECIFICATION';
    END IF;

    UPDATE public.profiles 
    SET role = new_role 
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- ANALYTICS INFRASTRUCTURE
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

CREATE INDEX IF NOT EXISTS idx_analytics_realtime_ts ON public.analytics_realtime (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_country_date ON public.analytics_country (date DESC);

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics" ON public.analytics_daily
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view country stats" ON public.analytics_country
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view realtime pulse" ON public.analytics_realtime
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));
