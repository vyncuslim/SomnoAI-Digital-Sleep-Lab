
-- ==========================================
-- SOMNOAI V19 KERNEL - CRITICAL PERMISSION FIX
-- ==========================================

-- 1. 确保核心字段存在
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_owner boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. 重写权限查询函数，确保返回所有鉴权维度
CREATE OR REPLACE FUNCTION public.get_profile_status()
RETURNS TABLE (
    role text,
    is_super_owner boolean,
    is_initialized boolean,
    is_blocked boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.role,
        p.is_super_owner,
        p.is_initialized,
        p.is_blocked
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;

-- 3. 授权命令（备用）：如果您现在进不去，可以在 Supabase SQL Editor 执行：
-- UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '您的邮箱';
