
-- ==========================================
-- SOMNOAI COMMAND PROTOCOL - CORE RPCs
-- ==========================================

-- 1. Global System Stats (Direct Count)
-- This ensures Owners and Admins see consistent data (e.g. 42 subjects)
CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if requester is at least an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
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

-- 2. Refined Subject Registry Access
-- Security Definer allows bypassing standard RLS to see all nodes for management
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
        p.updated_at,
        p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 3. The missing Block Protocol function
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Authorization check
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    -- Prevent self-blocking or super-owner blocking
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'SELF_PROTECT_TRIGGERED';
    END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id
    AND is_super_owner = false;
END;
$$;
