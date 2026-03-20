
-- Fix missing analytics RPCs and RLS policies

-- 1. Ensure analytics tables exist (in case previous migration failed)
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

CREATE TABLE IF NOT EXISTS public.login_attempts (
    email text PRIMARY KEY,
    attempts int DEFAULT 1,
    last_attempt timestamptz DEFAULT now()
);

-- 2. Fix RPCs (Ensure they exist and handle phone numbers)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_device_analytics(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_country_analytics(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.report_failed_login(text) TO anon, authenticated;

-- 3. Fix RLS Policies for Analytics and Logins
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_device ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to manage realtime analytics
DROP POLICY IF EXISTS "Anyone can manage realtime analytics" ON public.analytics_realtime;
CREATE POLICY "Anyone can manage realtime analytics" ON public.analytics_realtime
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to manage analytics_country
DROP POLICY IF EXISTS "Anyone can manage analytics_country" ON public.analytics_country;
CREATE POLICY "Anyone can manage analytics_country" ON public.analytics_country
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to manage analytics_device
DROP POLICY IF EXISTS "Anyone can manage analytics_device" ON public.analytics_device;
CREATE POLICY "Anyone can manage analytics_device" ON public.analytics_device
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to manage login_attempts (needed for RPC)
DROP POLICY IF EXISTS "Anyone can manage login_attempts" ON public.login_attempts;
CREATE POLICY "Anyone can manage login_attempts" ON public.login_attempts
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to insert logins
DROP POLICY IF EXISTS "Anyone can insert logins" ON public.logins;
CREATE POLICY "Anyone can insert logins" ON public.logins
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow users to see their own logins
DROP POLICY IF EXISTS "Users can see own logins" ON public.logins;
CREATE POLICY "Users can see own logins" ON public.logins
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. Ensure profiles can be updated by handle_new_user even if phone is used
-- (The existing trigger handles email, but if phone is used, we might need to adjust it)
-- Actually, the trigger uses new.email. If phone is used, new.email might be null.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider, role, is_super_owner, phone)
    VALUES (
        new.id, 
        COALESCE(new.email, ''), 
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
