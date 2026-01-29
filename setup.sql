
-- ==========================================
-- SOMNOAI V21 KERNEL - ADVANCED AUTH SECURITY
-- ==========================================

-- 1. Helper function for RLS
CREATE OR REPLACE FUNCTION public.is_super_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_super_owner, false) FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Enhanced Profile fetching for Auth Provider
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (
    id uuid,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.role, 'user'),
        COALESCE(p.is_super_owner, false),
        COALESCE(p.is_blocked, false),
        p.full_name
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;
