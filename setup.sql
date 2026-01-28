
-- ==========================================
-- SOMNOAI HIERARCHICAL ROLE SYSTEM (V6)
-- ==========================================

-- 1. 表结构平滑升级
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_owner boolean NOT NULL DEFAULT false;

-- 2. 角色类型约束（可选，推荐）
-- DO $$ BEGIN
--     CREATE TYPE user_role AS ENUM ('user', 'admin', 'owner');
-- EXCEPTION
--     WHEN duplicate_object THEN null;
-- END $$;

-- 3. 稳健的触发器 (维持现状但确保字段兼容)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_super_owner, full_name, provider)
  VALUES (
    new.id, 
    new.email, 
    'user', 
    false, 
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

-- 4. 权限设置示例（供开发者手动运行）
-- UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = 'YOUR_EMAIL@DOMAIN.COM';
