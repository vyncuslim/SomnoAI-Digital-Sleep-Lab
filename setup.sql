
-- 1. 确保基础档案表存在
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text, 
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. 核心：确保 user_data 表及其所有列存在
-- 如果表不存在，则创建
CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer,
  height float,
  weight float,
  gender text,
  setup_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

-- 如果表已经存在，确保列存在（防止旧表导致缺失列错误）
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='age') THEN
        ALTER TABLE public.user_data ADD COLUMN age integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='height') THEN
        ALTER TABLE public.user_data ADD COLUMN height float;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='weight') THEN
        ALTER TABLE public.user_data ADD COLUMN weight float;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='gender') THEN
        ALTER TABLE public.user_data ADD COLUMN gender text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_data' AND column_name='setup_completed') THEN
        ALTER TABLE public.user_data ADD COLUMN setup_completed boolean DEFAULT false;
    END IF;
END $$;

-- 3. 重新设置 RLS 策略，确保权限正确
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 清理旧策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;

-- 重新创建策略
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own data" ON public.user_data FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON public.user_data FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.user_data FOR UPDATE USING (auth.uid() = id);

-- 4. 触发器：新用户注册自动创建 Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 补全现有用户
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
