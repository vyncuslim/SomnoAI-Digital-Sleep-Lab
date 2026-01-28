
-- ==========================================
-- SOMNOAI SOVEREIGNTY SYSTEM (V13 - FINAL)
-- ==========================================

-- 1. 深度清理：彻底清除 profiles 表上所有类型的 RLS 政策
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. 权限物理同步引擎
-- 该函数将权限状态写入 auth.users 表，从而使其包含在 JWT 令牌中
CREATE OR REPLACE FUNCTION public.sync_user_privileges()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users 
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', COALESCE(new.role, 'user'), 
      'is_super_owner', COALESCE(new.is_super_owner, false),
      'is_admin_node', (new.role IN ('admin', 'owner') OR new.is_super_owner = true)
    )
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 重新建立触发器
DROP TRIGGER IF EXISTS on_profile_privilege_change ON public.profiles;
CREATE TRIGGER on_profile_privilege_change
  AFTER INSERT OR UPDATE OF role, is_super_owner ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_privileges();

-- 4. 部署零递归 RLS 政策
-- 这里的关键是：政策逻辑只引用 JWT (auth.jwt())，而不查询 profiles 表本身
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 政策 A: 允许用户读取和修改自己的档案 (使用 ID 直接比对，无递归)
CREATE POLICY "v13_self_access" ON public.profiles 
FOR ALL USING (auth.uid() = id);

-- 政策 B: 允许管理员读取所有受试者档案 (从 JWT 读取标记，无递归)
CREATE POLICY "v13_admin_read_all" ON public.profiles 
FOR SELECT USING (
  ((auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true)
);

-- 政策 C: 允许实验室所有人修改权限 (同样基于 JWT)
CREATE POLICY "v13_owner_write" ON public.profiles
FOR UPDATE USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('owner', 'super_owner') OR
  ((auth.jwt() -> 'app_metadata' ->> 'is_super_owner')::boolean = true)
);

-- 5. 初始同步：强制将当前所有用户的权限压入 JWT
-- 注意：执行此脚本后，必须重新登录
UPDATE public.profiles SET role = role; 

-- 6. 提权示例（请在 SQL 编辑器中手动执行并替换邮箱）
-- UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = 'YOUR_ADMIN_EMAIL';
