
-- ==========================================
-- SOMNOAI CORE SECURITY & ADMIN PROTOCOLS
-- ==========================================

-- 1. Identity Verification (Optimized for Schema Cache Visibility)
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
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, p.email
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;

-- Explicitly Grant Execute Access
GRANT EXECUTE ON FUNCTION public.get_my_detailed_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_detailed_profile() TO anon;

-- 2. Global System Stats
CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (LOWER(role) IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    SELECT json_build_object(
        'total_subjects', (SELECT count(*) FROM public.profiles),
        'admin_nodes', (SELECT count(*) FROM public.profiles WHERE LOWER(role) IN ('admin', 'owner') OR is_super_owner = true),
        'blocked_nodes', (SELECT count(*) FROM public.profiles WHERE is_blocked = true),
        'active_24h', (SELECT count(*) FROM public.profiles WHERE updated_at > now() - interval '24 hours'),
        'system_latency', 42
    ) INTO result;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_global_stats() TO authenticated;

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
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (LOWER(role) IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    RETURN QUERY
    SELECT 
        p.id, p.email, p.full_name, p.role, p.is_super_owner, p.is_blocked, 
        p.updated_at as last_sign_in_at, p.created_at
    FROM public.profiles p
    ORDER BY p.is_super_owner DESC, p.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated;

-- 4. Block Protocol
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (LOWER(role) IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE';
    END IF;

    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'SELF_PROTECT_TRIGGERED';
    END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id
    AND is_super_owner = false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_block(uuid) TO authenticated;

-- 5. Clearance Modification
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    requester_role text;
BEGIN
    SELECT LOWER(role) INTO requester_role FROM public.profiles WHERE id = auth.uid();
    
    IF requester_role != 'owner' AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_owner = true) THEN
        RAISE EXCEPTION 'PRIME_CLEARANCE_REQUIRED';
    END IF;

    UPDATE public.profiles 
    SET role = LOWER(new_role) 
    WHERE id = target_user_id
    AND is_super_owner = false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;
