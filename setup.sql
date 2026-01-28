
-- ==========================================
-- SOMNOAI SOVEREIGNTY SYSTEM (V10 - JWT SYNC)
-- ==========================================

-- 1. 创建特权同步函数（SECURITY DEFINER 绕过 RLS）
-- 该函数将用户的角色同步到 Supabase Auth 内部元数据中，加速 RLS 判定并防止递归
CREATE OR REPLACE FUNCTION public.sync_user_privileges()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users 
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    jsonb_build_object(
      'role', new.role, 
      'is_super_owner', new.is_super_owner,
      'is_admin_node', (new.role IN ('admin', 'owner') OR new.is_super_owner = true)
    )
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 绑定触发器到 profiles 表
DROP TRIGGER IF EXISTS on_profile_privilege_change ON public.profiles;
CREATE TRIGGER on_profile_privilege_change
  AFTER INSERT OR UPDATE OF role, is_super_owner ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_privileges();

-- 3. 彻底重置 RLS 政策（使用 JWT 检查替代表查询）
DROP POLICY IF EXISTS "allow_self_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;

-- 政策 A: 允许用户操作自己的档案 (基于 UID)
CREATE POLICY "allow_self_all_profiles" ON public.profiles 
FOR ALL USING (auth.uid() = id);

-- 政策 B: 允许管理员读取所有档案 (基于 JWT app_metadata，零递归)
CREATE POLICY "admins_read_all_profiles" ON public.profiles 
FOR SELECT USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true
);

-- 4. 修复存量数据权限（仅供参考，实际由 SQL 窗口执行）
-- UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = 'YOUR_EMAIL';
