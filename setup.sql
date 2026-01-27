-- ==========================================
-- SOMNOAI DATABASE DEEP REPAIR & RESET
-- ==========================================

-- 1. 彻底移除所有可能的冲突项
-- 撤销触发器以防在修改表时报错
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. 解决 42P16 视图/表冲突：强制删除并清理依赖
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP VIEW public.profiles CASCADE;
    END IF;
END $$;

-- 3. 重建 profiles 实体表（确保字段完整且具备默认值）
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text NOT NULL DEFAULT 'user',
    full_name text DEFAULT '',
    is_blocked boolean NOT NULL DEFAULT false,
    is_initialized boolean NOT NULL DEFAULT false,
    has_app_data boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. 重建 user_data 表
CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age integer,
    weight float,
    height float,
    gender text,
    created_at timestamptz DEFAULT now()
);

-- 5. 创建高容错性的触发器函数
-- 增加 COALESCE 处理空值，防止插入失败
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, is_blocked, is_initialized, has_app_data)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    false, 
    false, 
    false
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 重新绑定触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. 权限修复：确保触发器可以绕过 RLS 执行
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 配置 RLS 策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 用户只能读写自己的数据
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 管理员完全权限（使用 SECURITY DEFINER 函数避免递归）
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL 
USING ( public.is_admin() );

DROP POLICY IF EXISTS "Users can manage own data" ON public.user_data;
CREATE POLICY "Users can manage own data" ON public.user_data FOR ALL USING (auth.uid() = id);

-- 9. 显式授予权限（针对某些 Supabase 实例的权限限制）
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 10. 通知后端刷新缓存
NOTIFY pgrst, 'reload schema';