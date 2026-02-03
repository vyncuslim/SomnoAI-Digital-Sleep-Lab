
-- ==========================================
-- SOMNO LAB CORE SCHEMA (V10.4)
-- ==========================================

-- 4. 告警接收矩阵
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    label text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 初始化默认接收者
INSERT INTO public.notification_recipients (email, label) 
VALUES ('ongyuze1401@gmail.com', 'Primary Lab Admin')
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 安全策略 (RLS)
-- ==========================================

-- Notification Recipients Policies
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage recipients" ON public.notification_recipients
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- (Existing policies from V10.3 remain...)
