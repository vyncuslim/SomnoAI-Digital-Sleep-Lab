
-- ==========================================
-- AUDIT & LOGGING INFRASTRUCTURE (V7.0)
-- ==========================================

-- 1. 审计日志表
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO',
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp timestamptz DEFAULT now()
);

-- 2. 安全事件表
CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text,
    event_type text NOT NULL,
    details text,
    created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 权限策略：仅管理员可见
CREATE POLICY "Admins can view audit logs" ON public.audit_logs 
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view security logs" ON public.security_events 
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- 3. 安全定义函数 (SECURITY DEFINER)
-- 允许前端在没有完整 Auth Session 的情况下（如登录中途）写入日志

CREATE OR REPLACE FUNCTION public.log_security_event(p_email text, p_event_type text, p_details text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.security_events (user_email, event_type, details)
    VALUES (p_email, p_event_type, p_details);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_audit_entry(p_action text, p_details text, p_level text, p_user_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
    INSERT INTO public.audit_logs (action, details, level, user_id)
    VALUES (p_action, p_details, p_level, p_user_id);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予匿名用户执行权限（仅限写入）
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_entry(text, text, text, uuid) TO anon, authenticated;
