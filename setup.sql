
-- ==========================================
-- DIGITAL SLEEP LAB CORE SCHEMA (V11.2)
-- ==========================================

-- 1. Profiles Table (核心注册表)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE, -- Removed NOT NULL to support phone-only signups
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
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, role, is_super_owner, phone)
    VALUES (
        new.id, 
        new.email, -- Will be NULL for phone signups
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.app_metadata->>'provider',
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN 'owner' ELSE 'user' END,
        CASE WHEN new.email = 'ongyuze1401@gmail.com' THEN true ELSE false END,
        new.phone
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
    actor_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    target_user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    action text NOT NULL,
    source text DEFAULT 'system',
    category text DEFAULT 'system',
    status text DEFAULT 'success',
    level text DEFAULT 'info',
    message text,
    details text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    path text,
    method text,
    request_id text,
    session_id text,
    error_code text,
    created_at timestamptz DEFAULT now()
);

-- RPC: 写入审计日志
DROP FUNCTION IF EXISTS public.write_audit_log(text, text, text, text, text, uuid, uuid, text, text, text, text, text, text, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_source text,
  p_level text,
  p_category text,
  p_action text,
  p_status text,
  p_actor_user_id uuid DEFAULT NULL,
  p_target_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_request_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_path text DEFAULT NULL,
  p_method text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    source, level, category, action, status, 
    actor_user_id, target_user_id, session_id, request_id, 
    ip_address, user_agent, path, method, error_code, 
    message, metadata
  )
  VALUES (
    p_source, p_level, p_category, p_action, p_status,
    p_actor_user_id, p_target_user_id, p_session_id, p_request_id,
    p_ip_address, p_user_agent, p_path, p_method, p_error_code,
    p_message, p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 7. Missing tables for Admin Dashboard
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL UNIQUE,
    page_views integer DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    bounce_rate numeric DEFAULT 0,
    avg_session_duration integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_country (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code text NOT NULL,
    country_name text,
    visitor_count integer DEFAULT 0,
    last_updated timestamptz DEFAULT now(),
    UNIQUE(country_code)
);

CREATE TABLE IF NOT EXISTS public.analytics_device (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_type text NOT NULL,
    browser text,
    os text,
    visitor_count integer DEFAULT 0,
    last_updated timestamptz DEFAULT now(),
    UNIQUE(device_type, browser, os)
);

CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    session_id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    path text,
    last_activity timestamptz DEFAULT now()
);

-- RPC: 增加设备统计
CREATE OR REPLACE FUNCTION public.increment_device_analytics(d_type text, browser_info text, os_info text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.analytics_device (device_type, browser, os, visitor_count)
    VALUES (d_type, browser_info, os_info, 1)
    ON CONFLICT (device_type, browser, os) DO UPDATE 
    SET visitor_count = analytics_device.visitor_count + 1,
        last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 增加国家统计
CREATE OR REPLACE FUNCTION public.increment_country_analytics(c_code text, c_name text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.analytics_country (country_code, country_name, visitor_count)
    VALUES (c_code, c_name, 1)
    ON CONFLICT (country_code) DO UPDATE 
    SET visitor_count = analytics_country.visitor_count + 1,
        last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.security_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    type text, -- Added for compatibility with code using 'type'
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address text,
    user_agent text,
    severity text DEFAULT 'INFO',
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- RPC: 写入安全事件
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_type text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'INFO',
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    type, event_type, details, severity, user_id, ip_address, user_agent
  )
  VALUES (
    p_type, p_type, p_details, p_severity, p_user_id, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 写入错误日志
CREATE OR REPLACE FUNCTION public.log_error(
  p_error_message text,
  p_error_stack text DEFAULT NULL,
  p_context text DEFAULT NULL,
  p_severity text DEFAULT 'CRITICAL',
  p_user_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_error_id uuid;
BEGIN
  INSERT INTO public.error_logs (
    error_message, error_stack, context, severity, user_id, details
  )
  VALUES (
    p_error_message, p_error_stack, p_context, p_severity, p_user_id, p_details
  )
  RETURNING id INTO v_error_id;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.sleep_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    score integer DEFAULT 0,
    total_duration integer DEFAULT 0,
    deep_ratio numeric DEFAULT 0,
    rem_ratio numeric DEFAULT 0,
    efficiency numeric DEFAULT 0,
    heart_rate_data jsonb DEFAULT '{}'::jsonb,
    stages jsonb DEFAULT '[]'::jsonb,
    ai_insights jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email text,
    type text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'open',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.error_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    error_message text NOT NULL,
    error_stack text,
    context text,
    severity text DEFAULT 'ERROR',
    details jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subject text,
    body text NOT NULL,
    type text DEFAULT 'email',
    status text DEFAULT 'sent',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- RPC: 报告登录失败
CREATE OR REPLACE FUNCTION public.report_failed_login(target_email text)
RETURNS void AS $$
DECLARE
  current_attempts int;
  v_is_blocked boolean;
BEGIN
  -- Handle empty input
  IF target_email IS NULL OR target_email = '' THEN
    RETURN;
  END IF;

  -- Check if user is already blocked
  SELECT is_blocked INTO v_is_blocked FROM public.profiles 
  WHERE email = target_email OR phone = target_email;
  
  IF v_is_blocked THEN
    RAISE EXCEPTION 'Security policy: Too many failed attempts. Please try again later.';
  END IF;

  INSERT INTO public.login_attempts (email, attempts, last_attempt)
  VALUES (target_email, 1, now())
  ON CONFLICT (email) DO UPDATE 
  SET attempts = public.login_attempts.attempts + 1,
      last_attempt = now()
  RETURNING attempts INTO current_attempts;

  -- Block if attempts >= 5
  IF current_attempts >= 5 THEN
    UPDATE public.profiles 
    SET is_blocked = true, 
        failed_login_attempts = current_attempts,
        block_code = 'BRUTE_FORCE_PROTECTION'
    WHERE email = target_email OR phone = target_email;
  ELSE
    UPDATE public.profiles 
    SET failed_login_attempts = current_attempts 
    WHERE email = target_email OR phone = target_email;
  END IF;
  
  -- Log to security_events
  INSERT INTO public.security_events (event_type, type, details, severity)
  VALUES ('FAILED_LOGIN', 'FAILED_LOGIN', jsonb_build_object('identifier', target_email, 'attempts', current_attempts), 'WARNING');
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
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to insert error logs
DROP POLICY IF EXISTS "Users can insert error logs" ON public.error_logs;
CREATE POLICY "Users can insert error logs" ON public.error_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to insert feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback" ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to read their own sleep records
DROP POLICY IF EXISTS "Users can read own sleep records" ON public.sleep_records;
CREATE POLICY "Users can read own sleep records" ON public.sleep_records
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admin full access for all new tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['analytics_daily', 'security_events', 'sleep_records', 'feedback', 'error_logs', 'communications', 'reviews'])
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Admin full access" ON public.%I;
            CREATE POLICY "Admin full access" ON public.%I
            FOR ALL TO authenticated
            USING (public.is_admin_check(auth.uid()));
        ', t, t);
    END LOOP;
END $$;

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