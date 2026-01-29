
-- ==========================================
-- SOMNOAI V16 KERNEL - RPC SECURITY ISOLATION
-- ==========================================

-- 1. 净化 RLS 策略 (彻底杜绝递归)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname); END LOOP;
END $$;

-- 核心 RLS：用户只能操作自己的数据
CREATE POLICY "v16_self_sovereignty" 
ON public.profiles FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. 部署 SECURITY DEFINER 管理函数 (绕过 RLS，内部鉴权)

-- 函数 A: 管理员获取所有受试者列表
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
BEGIN
  -- 内部鉴权：查询调用者的角色
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'owner') THEN
    RAISE EXCEPTION 'Clearance Denied: Required level ADMIN or higher.';
  END IF;

  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

-- 函数 B: 管理员切换封锁状态
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
  target_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;

  -- 权限逻辑判定
  IF caller_role NOT IN ('admin', 'owner') THEN RAISE EXCEPTION 'Access Denied'; END IF;
  IF target_role = 'owner' AND caller_role <> 'owner' THEN RAISE EXCEPTION 'Cannot block owner'; END IF;

  UPDATE public.profiles 
  SET is_blocked = NOT is_blocked 
  WHERE id = target_user_id;
END;
$$;

-- 函数 C: 修改角色
CREATE OR REPLACE FUNCTION public.admin_set_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  
  IF caller_role <> 'owner' THEN
    RAISE EXCEPTION 'Clearance Denied: Only OWNER can promote nodes.';
  END IF;

  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

-- 3. 用户初始化状态 RPC (已在 V15 部署，此处优化)
CREATE OR REPLACE FUNCTION public.get_profile_status()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'is_initialized', is_initialized,
    'has_app_data', has_app_data,
    'is_blocked', is_blocked,
    'role', role
  ) INTO result
  FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(result, jsonb_build_object('is_initialized', false, 'has_app_data', false, 'is_blocked', false));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
