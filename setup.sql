
-- ==========================================
-- SOMNOAI 数据库修复与初始化脚本 (V3.1 精准版)
-- ==========================================

-- 1. 确保核心表结构
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
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

-- 2. 原子化补齐字段
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='age') THEN
    ALTER TABLE public.user_data ADD COLUMN age integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='setup_completed') THEN
    ALTER TABLE public.user_data ADD COLUMN setup_completed boolean DEFAULT false;
  END IF;
END $$;

-- 3. 核心安全配置：显式授予所有角色对表的访问权限
-- 这通常是解决 "Protocol Error: Column not found" 的隐藏原因
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 4. 开启 RLS 并配置策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own data" ON public.user_data;
CREATE POLICY "Users manage own data" ON public.user_data FOR ALL USING (auth.uid() = id);

-- 5. 强制重载后端的缓存字典
NOTIFY pgrst, 'reload schema';
