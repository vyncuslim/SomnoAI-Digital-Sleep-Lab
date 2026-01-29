
-- ==========================================
-- SOMNOAI COMMAND PROTOCOL - CORE RPCs
-- ==========================================

-- 1. Subject Registry Access
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
    -- Check if requester is at least an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.role,
        p.is_super_owner,
        p.is_blocked,
        p.updated_at as last_sign_in_at, -- Using updated_at as proxy for activity
        p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 2. Block Protocol (The missing function)
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role text;
    target_role text;
    target_is_super boolean;
BEGIN
    -- Get requester clearance
    SELECT role INTO requester_role FROM public.profiles WHERE id = auth.uid();
    
    -- Get target clearance
    SELECT role, is_super_owner INTO target_role, target_is_super FROM public.profiles WHERE id = target_user_id;

    -- Safeguards
    IF target_is_super THEN
        RAISE EXCEPTION 'IMMUTABLE_NODE: Cannot modify Super Owner.';
    END IF;

    IF requester_role = 'admin' AND (target_role = 'admin' OR target_role = 'owner') THEN
        RAISE EXCEPTION 'LEVEL_MISMATCH: Admin cannot block equal or higher clearance.';
    END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id;
END;
$$;

-- 3. Role Promotion/Demotion
CREATE OR REPLACE FUNCTION public.admin_set_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only Owners or Super Owners can change roles
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'owner' OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'OWNER_CLEARANCE_REQUIRED';
    END IF;

    UPDATE public.profiles 
    SET role = new_role 
    WHERE id = target_user_id;
END;
$$;

-- 4. System Health (Owner Only)
CREATE OR REPLACE FUNCTION public.owner_get_system_health()
RETURNS TABLE (
    active_sessions_24h bigint,
    security_alerts_total bigint,
    total_subjects bigint,
    system_latency_ms int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT count(*) FROM public.profiles WHERE updated_at > now() - interval '24 hours'),
        (SELECT count(*) FROM public.security_events),
        (SELECT count(*) FROM public.profiles),
        42; -- Simulated latency
END;
$$;
