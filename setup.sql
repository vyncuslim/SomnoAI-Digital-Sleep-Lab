
-- ==========================================
-- SOMNOAI SOVEREIGNTY SYSTEM (V12 - NUCLEAR RESET)
-- ==========================================

-- 1. 动态清理：自动删除 profiles 表上的“所有”现有政策
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. 核心：同步函数（SECURITY DEFINER 绕过 RLS）
-- 将权限状态压入 auth.users 的 app_metadata 中，使 RLS 校验变为 0 次查询
CREATE OR REPLACE FUNCTION public.sync_user_privileges()
RETURNS trigger AS $$
BEGIN
  -- 更新 auth.users 表中的 app_metadata
  -- 这样做可以让 RLS 政策直接从加密的 JWT 令牌中读取角色，而不需要查询数据库表
  UPDATE auth.users 
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', new.role, 
      'is_super_owner', new.is_super_owner,
      'is_admin_node', (new.role IN ('admin', 'owner') OR new.is_super_owner = true)
    )
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 重新绑定触发器
DROP TRIGGER IF EXISTS on_profile_privilege_change ON public.profiles;
CREATE TRIGGER on_profile_privilege_change
  AFTER INSERT OR UPDATE OF role, is_super_owner ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_privileges();

-- 4. 部署全新的 RLS 政策（基于 JWT 声明，物理隔离递归）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 政策 A: 允许用户操作自己的档案 (UID 直接匹配)
CREATE POLICY "v12_self_access" ON public.profiles 
FOR ALL USING (auth.uid() = id);

-- 政策 B: 允许管理员读取所有档案 (依赖 JWT app_metadata，零查询，绝无递归)
CREATE POLICY "v12_admin_read_all" ON public.profiles 
FOR SELECT USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true
);

-- 5. 对现有管理员进行一次性手动权限刷入（替换下方 EMAIL）
-- UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '您的邮箱';
