
-- ==========================================
-- SOMNO LAB CORE SCHEMA (V11.2)
-- ==========================================

-- 1. Profiles Table (核心注册表)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    role text DEFAULT 'user' NOT NULL,
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (role IN ('user', 'editor', 'admin', 'owner'))
);

-- 2. 权限助手函数 (SECURITY DEFINER 以防止 RLS 递归)
-- 该函数在内部查询 profiles 表时会跳过 RLS，从而打破死循环
CREATE OR REPLACE FUNCTION public.is_admin_check(uid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
    AND (role IN ('admin', 'owner') OR is_super_owner = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 前端通过此函数获取自身资料，完全避开递归策略风险
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 身份触发器 (新受试者接入时自动注册)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        'user'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 审计日志阵列
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO',
    created_at timestamptz DEFAULT now()
);

-- 5. 通知接收矩阵
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    label text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 初始化默认接收节点
INSERT INTO public.notification_recipients (email, label) 
VALUES ('contact@sleepsomno.com', 'Primary Lab Admin')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 安全策略 (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- 【Profiles 策略】
-- FIX: 使用 is_admin_check() 助手函数避免 42P17 无限递归
DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
CREATE POLICY "Profiles visibility" ON public.profiles
FOR SELECT TO authenticated
USING (
    auth.uid() = id 
    OR 
    public.is_admin_check(auth.uid())
);

CREATE POLICY "Profile self update" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 【Audit Logs 策略】
-- 允许所有已认证用户写入日志（以便上报异常），但只有管理员可查看和管理
DROP POLICY IF EXISTS "Admin audit access" ON public.audit_logs;
CREATE POLICY "Anyone can insert logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin view logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

CREATE POLICY "Admin delete logs" ON public.audit_logs
FOR DELETE TO authenticated
USING (public.is_admin_check(auth.uid()));

-- 【Recipients 策略】
DROP POLICY IF EXISTS "Admin recipient management" ON public.notification_recipients;
CREATE POLICY "Admin recipient management" ON public.notification_recipients
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()));
