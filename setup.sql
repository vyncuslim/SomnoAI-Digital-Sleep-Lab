
-- ==========================================
-- SOMNOAI SOVEREIGNTY SYSTEM (V11 - POLICY RESET)
-- ==========================================

-- 1. 清理所有已知的旧政策（防止递归残留）
DROP POLICY IF EXISTS "allow_self_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "service_role_policy" ON public.profiles;

-- 2. 核心：同步函数（SECURITY DEFINER 绕过 RLS）
-- 将权限状态压入 auth.users 的 app_metadata 中，使 RLS 校验变为 0 次查询
CREATE OR REPLACE FUNCTION public.sync_user_privileges()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users 
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    jsonb_build_object(
      'role', new.role, 
      'is_super_owner', new.is_super_owner,
      -- 准入逻辑：admin/owner 或 super_owner 均视为管理员节点
      'is_admin_node', (new.role IN ('admin', 'owner') OR new.is_super_owner = true)
    )
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新绑定触发器
DROP TRIGGER IF EXISTS on_profile_privilege_change ON public.profiles;
CREATE TRIGGER on_profile_privilege_change
  AFTER INSERT OR UPDATE OF role, is_super_owner ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_privileges();

-- 4. 部署全新的 RLS 政策（基于 JWT 声明，物理隔离递归）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 政策 A: 允许用户操作自己的档案
CREATE POLICY "v11_self_access" ON public.profiles 
FOR ALL USING (auth.uid() = id);

-- 政策 B: 允许管理员读取所有档案 (依赖 JWT，不再查询 profiles 表)
CREATE POLICY "v11_admin_read_all" ON public.profiles 
FOR SELECT USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true
);

-- 5. 初始权限校准（为存量账户刷入权限标记）
-- 注意：执行此脚本后，管理员需重新登录以刷新 JWT 令牌
