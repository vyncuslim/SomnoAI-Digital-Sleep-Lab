
-- ==========================================
-- SOMNOAI CORE INFRASTRUCTURE - TABLES
-- ==========================================

-- 1. Profiles (Core Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    role text DEFAULT 'user',
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Feedback (Registry Log)
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    type text NOT NULL,
    content text NOT NULL,
    email text NOT NULL,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3. Security Events (Audit Log)
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp timestamptz DEFAULT now(),
    event_type text NOT NULL,
    event_reason text,
    email text,
    user_id uuid REFERENCES auth.users(id)
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Public profiles are viewable by admins" ON public.profiles
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Feedback Policies
CREATE POLICY "Authenticated users can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view feedback" ON public.feedback
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Security Event Policies
CREATE POLICY "Admins can view security events" ON public.security_events
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- ==========================================
-- CORE ADMINISTRATIVE RPCs
-- ==========================================

-- 1. Detailed Profile Sync
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (
    id uuid,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text,
    email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, p.email
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;

-- 2. Global System Stats
CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    SELECT json_build_object(
        'total_subjects', (SELECT count(*) FROM public.profiles),
        'admin_nodes', (SELECT count(*) FROM public.profiles WHERE role IN ('admin', 'owner')),
        'blocked_nodes', (SELECT count(*) FROM public.profiles WHERE is_blocked = true),
        'active_24h', (SELECT count(*) FROM public.profiles WHERE updated_at > now() - interval '24 hours'),
        'system_latency', 42
    ) INTO result;
    RETURN result;
END;
$$;

-- 3. Subject Registry Access
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    last_sign_in_at timestamptz,
    created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.role, p.is_super_owner, p.is_blocked, p.updated_at, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 4. Block Protocol
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    IF target_user_id = auth.uid() THEN RAISE EXCEPTION 'SELF_PROTECT_TRIGGERED'; END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id AND is_super_owner = false;
END;
$$;

-- 5. Clearance modification (Owner Only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role text;
BEGIN
    SELECT p.role INTO requester_role FROM public.profiles p WHERE p.id = auth.uid();
    
    IF requester_role != 'owner' AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_owner = true) THEN
        RAISE EXCEPTION 'PRIME_CLEARANCE_REQUIRED';
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND is_super_owner = true) THEN
        RAISE EXCEPTION 'IMMUTABLE_NODE';
    END IF;

    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END;
$$;
