
-- 1. 确保基础 profiles 表存在
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text, 
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 确保 user_data 表结构完整
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. 【强力修复】物理强制重写列元数据 (Force rewrite column metadata)
-- 即使列已经存在，重新声明类型会强制数据库更新统计信息和元数据缓存
ALTER TABLE public.user_data ALTER COLUMN age SET DEFAULT 0;
ALTER TABLE public.user_data ALTER COLUMN age TYPE integer;
ALTER TABLE public.user_data ALTER COLUMN height SET DEFAULT 0;
ALTER TABLE public.user_data ALTER COLUMN weight SET DEFAULT 0;

-- 4. 显式授予权限 (Grant explicit permissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. 重新配置 RLS (Re-apply RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own user_data" ON public.user_data;
CREATE POLICY "Users can view own user_data" ON public.user_data FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own user_data" ON public.user_data;
CREATE POLICY "Users can insert own user_data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user_data" ON public.user_data;
CREATE POLICY "Users can update own user_data" ON public.user_data FOR UPDATE USING (auth.uid() = id);

-- 6. 【核心修复】强制物理层面的 Schema 变更信号
-- 修改注释是强制触发 PostgREST 刷新缓存的最快非破坏性方法
COMMENT ON TABLE public.user_data IS 'SomnoAI Core Metrics - Last Restructure: ' || now();
COMMENT ON TABLE public.profiles IS 'SomnoAI User Profiles - Last Restructure: ' || now();

-- 7. 再次发送重载通知
NOTIFY pgrst, 'reload schema';
