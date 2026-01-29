
-- ==========================================
-- SOMNOAI V22 KERNEL - PRODUCTION AUTH
-- ==========================================

-- 强制确保 profiles 结构
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_owner boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- 核心权限查询函数 (绕过 RLS 策略，仅能查自己)
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (
    id uuid,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER -- 关键：以定义者权限执行，确保能读到 role
SET search_path = public
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

-- 极高权限检查助手
CREATE OR REPLACE FUNCTION public.is_super_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(is_super_owner, false) FROM public.profiles WHERE id = auth.uid()
$$;
