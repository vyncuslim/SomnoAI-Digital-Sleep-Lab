
-- 1. 确保基础 profiles 表结构正确
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text, 
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 确保 user_data 表及其所有生物指标列存在并带有默认值
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. 强制检查列是否存在（双重保障）
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.user_data ADD COLUMN age integer DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN 
        RAISE NOTICE 'column age already exists';
    END;
    
    BEGIN
        ALTER TABLE public.user_data ADD COLUMN height float DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN 
        RAISE NOTICE 'column height already exists';
    END;

    BEGIN
        ALTER TABLE public.user_data ADD COLUMN weight float DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN 
        RAISE NOTICE 'column weight already exists';
    END;
END $$;

-- 4. 显式授予权限（解决由于权限导致的“列不可见”问题）
GRANT ALL ON TABLE public.user_data TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.user_data TO service_role;

-- 5. 重新应用 RLS 策略
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
CREATE POLICY "Users can insert own data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
CREATE POLICY "Users can update own data" ON public.user_data FOR UPDATE USING (auth.uid() = id);

-- 6. 【核心修复步奏】强制触发缓存刷新
-- 方法 A: 修改表注释（物理层面的 Schema 变更会强制触发 PostgREST 刷新）
COMMENT ON TABLE public.user_data IS 'SomnoAI Subject Metrics v2.5';

-- 方法 B: 显式通知
NOTIFY pgrst, 'reload schema';

-- 方法 C: 重启缓存服务 (仅在上述无效时运行)
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'authenticator';
