
-- ==========================================
-- SOMNOAI SYSTEM RECOVERY & CALIBRATION (V3)
-- ==========================================

-- 1. 彻底清除旧逻辑
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. 表结构校验与对齐
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user',
    full_name text DEFAULT '',
    avatar_url text DEFAULT '',
    provider text DEFAULT 'email',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 确保 user_data 的字段类型为 numeric/float 以匹配前端的 parseFloat
CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age integer DEFAULT 0,
    weight numeric DEFAULT 0.0,
    height numeric DEFAULT 0.0,
    gender text DEFAULT 'prefer-not-to-say',
    created_at timestamptz DEFAULT now()
);

-- 3. 增强版自动注册触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 创建 Profile
  INSERT INTO public.profiles (id, email, role, full_name, provider)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.app_metadata->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    provider = EXCLUDED.provider;

  -- 创建生物数据基础行
  INSERT INTO public.user_data (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 激进的 RLS 策略 (解决 403)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Profiles: 允许认证用户对自己记录的完全控制
DROP POLICY IF EXISTS "profiles_self_all" ON public.profiles;
CREATE POLICY "profiles_self_all" ON public.profiles 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User Data: 允许认证用户对自己记录的完全控制
DROP POLICY IF EXISTS "user_data_self_all" ON public.user_data;
CREATE POLICY "user_data_self_all" ON public.user_data 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. 权限分配 (关键：确保 PostgREST 有权访问)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.user_data TO anon, authenticated, service_role;

-- 6. 修复已有账户的缺失记录
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_data (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
