
-- ==========================================
-- SOMNOAI V18 KERNEL - ADVANCED PERMISSION ARCHITECTURE
-- ==========================================

-- 1. 完善 profiles 表结构
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_owner boolean DEFAULT false;

-- 2. 增强版的封禁逻辑 (带有角色交叉检查)
CREATE OR REPLACE FUNCTION public.admin_toggle_block(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  performer_role text;
  target_role text;
  target_is_super boolean;
BEGIN
  -- 获取执行者的角色
  SELECT role INTO performer_role FROM public.profiles WHERE id = auth.uid();
  
  -- 获取目标的详细信息
  SELECT role, is_super_owner INTO target_role, target_is_super FROM public.profiles WHERE id = target_user_id;

  -- 安全检查 1: 任何人不能封禁 Super Owner
  IF target_is_super IS TRUE THEN
    RAISE EXCEPTION 'CRITICAL_FAILURE: Cannot suspend a Super Owner node.';
  END IF;

  -- 安全检查 2: Admin 只能封禁普通用户，不能封禁 Admin
  IF performer_role = 'admin' AND target_role IN ('admin', 'owner') THEN
    RAISE EXCEPTION 'ACCESS_DENIED: Admins cannot suspend nodes with equal or higher clearance.';
  END IF;

  -- 执行封禁/解封切换
  UPDATE public.profiles 
  SET is_blocked = NOT is_blocked 
  WHERE id = target_user_id;
END;
$$;

-- 3. Owner 专用的系统日志 RPC (返回更完整的数据)
CREATE OR REPLACE FUNCTION public.owner_get_system_health()
RETURNS TABLE (
    total_users bigint,
    active_sessions_24h bigint,
    security_alerts_total bigint,
    system_version text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (SELECT is_super_owner FROM public.profiles WHERE id = auth.uid()) IS NOT TRUE THEN
    RAISE EXCEPTION 'Insufficient clearance for System Health Node.';
  END IF;

  RETURN QUERY 
  SELECT 
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.security_events WHERE timestamp > now() - interval '24 hours'),
    (SELECT count(*) FROM public.security_events WHERE event_type != 'LOGIN'),
    (text 'V18.2-PRO');
END;
$$;
