
-- ==========================================
-- SOMNOAI SOVEREIGNTY SYSTEM (V9 - ANTI-RECURSION)
-- ==========================================

-- 1. 创建安全定义的管理员检查函数（绕过 RLS 递归）
CREATE OR REPLACE FUNCTION public.check_is_lab_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND (role IN ('admin', 'owner') OR is_super_owner = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 重置表结构和基础权限
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_owner boolean NOT NULL DEFAULT false;

-- 3. 彻底重写 RLS 政策，使用安全函数
DROP POLICY IF EXISTS "allow_self_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;

-- 政策 A: 允许用户管理自己的档案
CREATE POLICY "allow_self_all_profiles" ON public.profiles 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 政策 B: 允许管理员/Owner 读取所有档案（使用安全函数断开递归）
CREATE POLICY "admins_read_all_profiles" ON public.profiles 
FOR SELECT USING (public.check_is_lab_admin(auth.uid()));

-- 4. 初始化触发器增强
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_super_owner, full_name)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    false, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email;

  INSERT INTO public.user_data (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
