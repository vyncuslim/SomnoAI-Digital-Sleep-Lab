
-- ==========================================
-- SOMNO LAB CORE SCHEMA (V10.2)
-- ==========================================

-- 1. 审计日志表 (修复 RPC 缺失导致的问题)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO',
    user_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- 2. 安全事件表
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text,
    event_type text,
    event_reason text,
    notified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. 用户资料表扩展 (确保字段完整)
-- 假设 profiles 表已存在，我们确保它有角色字段
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_owner boolean DEFAULT false;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- ==========================================
-- 安全策略 (RLS)
-- ==========================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 允许管理员读取所有审计日志
CREATE POLICY "Admins read audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- 允许匿名/验证用户插入日志 (用于系统审计)
CREATE POLICY "Public insert audit logs" ON public.audit_logs
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- ==========================================
-- 核心辅助函数
-- ==========================================

-- 获取当前登录用户的详细资料 (用于 AuthContext)
CREATE OR REPLACE FUNCTION get_my_detailed_profile()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    is_super_owner boolean,
    is_blocked boolean,
    full_name text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.role, p.is_super_owner, p.is_blocked, p.full_name
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;
