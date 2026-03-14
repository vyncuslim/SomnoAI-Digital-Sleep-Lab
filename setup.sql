
-- ==========================================
-- DIGITAL SLEEP LAB CORE SCHEMA (V11.2)
-- ==========================================

-- 1. Profiles Table (核心注册表)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    role text DEFAULT 'user' NOT NULL,
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    is_initialized boolean DEFAULT false,
    has_app_data boolean DEFAULT false,
    phone text,
    avatar_url text,
    provider text,
    last_sign_in_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    stripe_customer_id text,
    subscription_id text,
    subscription_plan text,
    subscription_status text,
    block_code text,
    country text,
    last_login timestamptz,
    is_paying boolean DEFAULT false,
    failed_login_attempts int DEFAULT 0,
    login_alert_enabled boolean DEFAULT true,
    login_alert_mode text DEFAULT 'NEW_DEVICE',
    last_login_alert_sent_at timestamptz,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (role IN ('user', 'editor', 'admin', 'owner')),
    CONSTRAINT profiles_login_alert_mode_check CHECK (login_alert_mode IN ('NEW_DEVICE', 'EVERY_LOGIN'))
);

-- 2. 权限助手函数 (SECURITY DEFINER 以防止 RLS 递归)
CREATE OR REPLACE FUNCTION public.is_admin_check(uid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
    AND (role IN ('admin', 'owner') OR is_super_owner = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 前端通过此函数获取自身资料
DROP FUNCTION IF EXISTS public.get_my_detailed_profile();
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 身份触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, role, is_super_owner)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.app_metadata->>'provider',
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN 'owner' ELSE 'user' END,
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN true ELSE false END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器绑定 (仅在不存在时创建)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 4. 审计日志阵列
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    action text NOT NULL,
    details text,
    level text DEFAULT 'INFO',
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- Create audit_logs_recent view
CREATE OR REPLACE VIEW public.audit_logs_recent AS
SELECT * FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 100;

-- Grant access to the view
GRANT SELECT ON public.audit_logs_recent TO authenticated;
GRANT SELECT ON public.audit_logs_recent TO service_role;

-- 5. 通知接收矩阵
CREATE TABLE IF NOT EXISTS public.notification_recipients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    label text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 初始化默认接收节点
INSERT INTO public.notification_recipients (email, label) 
VALUES ('contact@digitalsleeplab.com', 'Primary Lab Admin')
ON CONFLICT (email) DO NOTHING;

-- 6. 登录尝试记录
CREATE TABLE IF NOT EXISTS public.login_attempts (
    email text PRIMARY KEY,
    attempts int DEFAULT 1,
    last_attempt timestamptz DEFAULT now()
);

-- RPC: 报告登录失败
CREATE OR REPLACE FUNCTION public.report_failed_login(target_email text)
RETURNS void AS $$
DECLARE
  current_attempts int;
BEGIN
  INSERT INTO public.login_attempts (email, attempts, last_attempt)
  VALUES (target_email, 1, now())
  ON CONFLICT (email) DO UPDATE 
  SET attempts = public.login_attempts.attempts + 1,
      last_attempt = now()
  RETURNING attempts INTO current_attempts;

  IF current_attempts >= 5 THEN
    UPDATE public.profiles SET is_blocked = true, failed_login_attempts = current_attempts WHERE email = target_email;
  ELSE
    UPDATE public.profiles SET failed_login_attempts = current_attempts WHERE email = target_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 封禁用户
CREATE OR REPLACE FUNCTION public.block_user(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET is_blocked = true 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 重置登录尝试
CREATE OR REPLACE FUNCTION public.reset_login_attempts(target_email text)
RETURNS void AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE email = target_email;
  UPDATE public.profiles SET failed_login_attempts = 0 WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 获取创始人统计数据
CREATE OR REPLACE FUNCTION public.get_founder_stats()
RETURNS json AS $$
DECLARE
  total_users int;
  new_today int;
  active_users int;
  paying_users int;
  country_distribution json;
BEGIN
  SELECT count(*) INTO total_users FROM public.profiles;
  SELECT count(*) INTO new_today FROM public.profiles WHERE created_at >= now() - interval '24 hours';
  SELECT count(*) INTO active_users FROM public.profiles WHERE last_login >= now() - interval '30 days';
  SELECT count(*) INTO paying_users FROM public.profiles WHERE is_paying = true OR subscription_plan != 'free';
  
  SELECT json_object_agg(country, count) INTO country_distribution
  FROM (
    SELECT COALESCE(country, 'Unknown') as country, count(*) as count
    FROM public.profiles
    GROUP BY country
  ) t;

  RETURN json_build_object(
    'total_users', total_users,
    'new_today', new_today,
    'active_users', active_users,
    'paying_users', paying_users,
    'country_distribution', country_distribution
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 应用设置表 (App Settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage settings" ON public.app_settings;
CREATE POLICY "Admin manage settings" ON public.app_settings
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()))
WITH CHECK (public.is_admin_check(auth.uid()));

DROP POLICY IF EXISTS "Public read settings" ON public.app_settings;
CREATE POLICY "Public read settings" ON public.app_settings
FOR SELECT TO anon, authenticated
USING (true);

-- 插入默认值
INSERT INTO public.app_settings (key, value) VALUES 
('ga_measurement_id', 'G-1WM4RE66ER'),
('google_site_verification', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 安全策略 (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
CREATE POLICY "Profiles visibility" ON public.profiles
FOR SELECT TO authenticated
USING (
    (auth.uid() = id AND is_blocked = false)
    OR 
    public.is_admin_check(auth.uid())
);

DROP POLICY IF EXISTS "Profile self update" ON public.profiles;
CREATE POLICY "Profile self update" ON public.profiles
FOR UPDATE TO authenticated
USING (
    (auth.uid() = id AND is_blocked = false)
    OR
    public.is_admin_check(auth.uid())
)
WITH CHECK (
    (auth.uid() = id AND is_blocked = false)
    OR
    public.is_admin_check(auth.uid())
);

DROP POLICY IF EXISTS "Admin audit access" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.audit_logs;
CREATE POLICY "Anyone can insert logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view logs" ON public.audit_logs;
CREATE POLICY "Admin view logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

DROP POLICY IF EXISTS "Admin delete logs" ON public.audit_logs;
CREATE POLICY "Admin delete logs" ON public.audit_logs
FOR DELETE TO authenticated
USING (public.is_admin_check(auth.uid()));

DROP POLICY IF EXISTS "Admin recipient management" ON public.notification_recipients;
CREATE POLICY "Admin recipient management" ON public.notification_recipients
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()));