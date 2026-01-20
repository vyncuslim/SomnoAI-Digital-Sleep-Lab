
-- 1. 物理重置 profiles 表，确保列名全小写
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text, 
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 物理重置 user_data 表
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. 强制元数据更新 (Force metadata rewrite)
ALTER TABLE public.profiles ALTER COLUMN full_name SET DATA TYPE text;
ALTER TABLE public.user_data ALTER COLUMN age SET DATA TYPE integer;

-- 4. 权限与 RLS 深度授权
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 允许用户在注册时插入自己的 Profile (关键修复)
DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
CREATE POLICY "Public can insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Data 策略同步
DROP POLICY IF EXISTS "Users can view own user_data" ON public.user_data;
CREATE POLICY "Users can view own user_data" ON public.user_data FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own user_data" ON public.user_data;
CREATE POLICY "Users can insert own user_data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user_data" ON public.user_data;
CREATE POLICY "Users can update own user_data" ON public.user_data FOR UPDATE USING (auth.uid() = id);

-- 5. 强制触发 PostgREST 架构缓存刷新
COMMENT ON TABLE public.profiles IS 'SomnoAI Profiles v2.1: ' || now();
COMMENT ON TABLE public.user_data IS 'SomnoAI Core Metrics v2.1: ' || now();

NOTIFY pgrst, 'reload schema';
