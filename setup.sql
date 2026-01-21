
-- 1. 确保 profiles 表存在
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 显式添加缺失的列 (解决 CREATE TABLE IF NOT EXISTS 不处理新列的问题)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name text;
  END IF;
END $$;

-- 3. 确保 user_data 表存在
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer DEFAULT 0,
  height float DEFAULT 0,
  weight float DEFAULT 0,
  gender text DEFAULT 'prefer-not-to-say',
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. 权限与 RLS (使用更加宽松的策略确保初次注册成功)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Data 策略
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
CREATE POLICY "Users can view own data" ON public.user_data FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
CREATE POLICY "Users can insert own data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
CREATE POLICY "Users can update own data" ON public.user_data FOR UPDATE USING (auth.uid() = id);

-- 5. 强制触发缓存刷新
NOTIFY pgrst, 'reload schema';
