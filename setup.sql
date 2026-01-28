
-- ==========================================
-- SOMNOAI HIERARCHICAL ROLE SYSTEM (V7)
-- ==========================================

-- 1. 确保核心权限字段存在
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_owner boolean NOT NULL DEFAULT false;

-- 2. 强化角色字段（支持 owner, admin, user）
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- 3. 安全的初始化触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_super_owner, full_name, provider)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    false, -- 严禁新用户自封超级权限
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    new.app_metadata->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email;

  INSERT INTO public.user_data (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重置 RLS 以支持管理权限（仅限拥有 admin/owner 角色的用户）
-- 注意：实际拦截逻辑主要由前端组件和 Edge Functions 完成，这里确保用户能读取自身
DROP POLICY IF EXISTS "allow_self_all_profiles" ON public.profiles;
CREATE POLICY "allow_self_all_profiles" ON public.profiles 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 允许 Admin/Owner 读取所有用户列表（用于管理面板）
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;
CREATE POLICY "admins_read_all_profiles" ON public.profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)
  )
);
