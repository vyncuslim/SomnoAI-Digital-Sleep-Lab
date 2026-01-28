
-- ==========================================
-- SOMNOAI SOVEREIGNTY KERNEL (V14 - RPC BASED)
-- ==========================================

-- 1. 获取当前用户角色的内核函数
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. 判断当前用户是否为超级所有者
CREATE OR REPLACE FUNCTION public.is_super_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_owner = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 主权阶梯判断函数 (决定 A 能否管理 B)
-- 规则：caller_weight > target_weight
CREATE OR REPLACE FUNCTION public.can_manage_user(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
    caller_role text;
    caller_is_super boolean;
    target_role text;
    target_is_super boolean;
    
    caller_weight int;
    target_weight int;
BEGIN
    -- 获取发起者信息
    SELECT role, is_super_owner INTO caller_role, caller_is_super 
    FROM public.profiles WHERE id = auth.uid();
    
    -- 获取目标信息
    SELECT role, is_super_owner INTO target_role, target_is_super 
    FROM public.profiles WHERE id = target_user_id;

    -- 自身保护
    IF auth.uid() = target_user_id THEN RETURN false; END IF;

    -- 计算权重
    caller_weight := CASE 
        WHEN caller_is_super THEN 4
        WHEN caller_role = 'owner' THEN 3
        WHEN caller_role = 'admin' THEN 2
        ELSE 1 END;
        
    target_weight := CASE 
        WHEN target_is_super THEN 4
        WHEN target_role = 'owner' THEN 3
        WHEN target_role = 'admin' THEN 2
        ELSE 1 END;

    -- 主权判定
    RETURN caller_weight > target_weight;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. 优化 RLS 政策 (现在政策变轻了，只读 metadata)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v13_self_access" ON public.profiles;
CREATE POLICY "v14_self_access" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "v13_admin_read_all" ON public.profiles;
CREATE POLICY "v14_admin_read_all" ON public.profiles FOR SELECT USING (
  ((auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true)
);

-- 5. 权限物理同步触发器 (保持 JWT 同步)
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
