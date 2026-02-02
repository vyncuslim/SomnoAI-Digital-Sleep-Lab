
-- ==========================================
-- SOMNO LAB CORE SCHEMA (V10.3)
-- ==========================================

-- 1. 审计日志表
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

-- 3. 日记条目表 (Diary Entries)
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    content text NOT NULL,
    mood text,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 安全策略 (RLS)
-- ==========================================

-- Audit Logs Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Public insert audit logs" ON public.audit_logs
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Security Events Policies
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read security events" ON public.security_events
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Diary Entries Policies (CRITICAL FIX FOR 42501 ERROR)
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own diary entries" ON public.diary_entries
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diary entries" ON public.diary_entries
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" ON public.diary_entries
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- 核心辅助函数
-- ==========================================

-- 获取当前登录用户的详细资料
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
