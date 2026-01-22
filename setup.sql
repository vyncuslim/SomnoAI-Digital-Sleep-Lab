-- ==========================================
-- SOMNOAI 数据库修复与初始化脚本 (V3.2)
-- ==========================================

-- 1. 确保核心表结构
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 安全审计与反馈表
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  status text, -- 'success' | 'failure'
  attempt_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  event_type text, -- 'AUTO_BLOCK' | 'MANUAL_BLOCK'
  event_reason text,
  notified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text,
  feedback_type text, -- 'report' | 'suggestion' | 'improvement'
  content text,
  target_email text DEFAULT 'ongyuze1401@gmail.com',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. 核心安全配置
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 4. 开启 RLS 并配置策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own data" ON public.user_data;
CREATE POLICY "Users manage own data" ON public.user_data FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
CREATE POLICY "Users can submit feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins see everything" ON public.profiles;
CREATE POLICY "Admins see everything" ON public.profiles FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. 强制重载后端的缓存字典
NOTIFY pgrst, 'reload schema';
