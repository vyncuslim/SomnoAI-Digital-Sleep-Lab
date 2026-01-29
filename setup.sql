
-- ==========================================
-- SOMNOAI CORE SECURITY & ADMIN PROTOCOLS
-- ==========================================

-- 1. Identity Verification (Enhanced)
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

-- 2. Global System Stats (Optimized for Owner visibility)
CREATE OR REPLACE FUNCTION public.admin_get_global_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    is_authorized boolean;
BEGIN
    -- Explicit clearance check
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) INTO is_authorized;

    IF NOT is_authorized THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE_PROTOCOL';
    END IF;

    SELECT json_build_object(
        'total_subjects', (SELECT count(*) FROM public.profiles),
        'admin_nodes', (SELECT count(*) FROM public.profiles WHERE role IN ('admin', 'owner') OR is_super_owner = true),
        'blocked_nodes', (SELECT count(*) FROM public.profiles WHERE is_blocked = true),
        'active_24h', (SELECT count(*) FROM public.profiles WHERE updated_at > now() - interval '24 hours'),
        'system_latency', 42
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 3. Subject Registry Access (Fixed ordering and authorization)
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
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE_PROTOCOL';
    END IF;

    RETURN QUERY
    SELECT 
        p.id, 
        p.email, 
        p.full_name, 
        p.role, 
        p.is_super_owner, 
        p.is_blocked, 
        p.updated_at as last_sign_in_at, 
        p.created_at
    FROM public.profiles p
    ORDER BY 
        p.is_super_owner DESC,
        CASE WHEN p.role = 'owner' THEN 1 WHEN p.role = 'admin' THEN 2 ELSE 3 END,
        p.created_at DESC;
END;
$$;

-- 4. Block Protocol (Protection for higher clearance)
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role IN ('admin', 'owner') OR is_super_owner = true)
    ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE_PROTOCOL';
    END IF;

    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'SELF_PROTECT_TRIGGERED';
    END IF;

    -- Prevent admins from blocking owners/super-owners
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = target_user_id 
        AND (role = 'owner' OR is_super_owner = true)
    ) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'owner' AND NOT (SELECT is_super_owner FROM public.profiles WHERE id = auth.uid()) THEN
        RAISE EXCEPTION 'TARGET_CLEARANCE_TOO_HIGH';
    END IF;

    UPDATE public.profiles 
    SET is_blocked = NOT is_blocked 
    WHERE id = target_user_id
    AND is_super_owner = false;
END;
$$;

-- 5. Clearance modification (Restricted to Owner/Super-Owner)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_role text;
    requester_is_super boolean;
BEGIN
    SELECT p.role, p.is_super_owner INTO requester_role, requester_is_super 
    FROM public.profiles p WHERE p.id = auth.uid();
    
    IF requester_role != 'owner' AND requester_is_super = false THEN
        RAISE EXCEPTION 'PRIME_CLEARANCE_REQUIRED';
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND is_super_owner = true) THEN
        RAISE EXCEPTION 'IMMUTABLE_NODE';
    END IF;

    IF new_role NOT IN ('user', 'admin', 'owner') THEN
        RAISE EXCEPTION 'INVALID_CLEARANCE_STRING';
    END IF;

    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END;
$$;
