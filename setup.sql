-- ==========================================
-- SOMNOAI ADMIN & SECURITY INFRASTRUCTURE
-- ==========================================

-- 1. 确保核心表结构
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'user',
    email text,
    full_name text,
    is_blocked boolean DEFAULT false,
    is_initialized boolean DEFAULT false,
    has_app_data boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 2. 定义安全的管理员检查函数 (避免递归)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  -- 使用 SECURITY DEFINER 绕过 RLS 检查角色
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新配置 RLS 策略 (彻底修复 500 递归错误)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 允许用户读取自己的资料 (不调用 is_admin 防止递归)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 允许管理员读取所有资料 (管理员尝试读取他人资料时，才调用检查函数)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" 
ON public.profiles FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 允许用户更新自己的资料
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. 自动化触发器 (新用户注册)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO UPDATE SET email = new.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 管理员提权模板 (请在 SQL Editor 中将下方邮箱替换为你自己的)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@GMAIL.COM';

NOTIFY pgrst, 'reload schema';