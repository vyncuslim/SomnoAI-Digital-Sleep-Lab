
-- Add missing tables requested by the user

-- Drop tables/views if they exist to prevent conflicts with table creation
DROP VIEW IF EXISTS public.daily_sleep_summary CASCADE;
DROP TABLE IF EXISTS public.daily_sleep_summary CASCADE;
DROP VIEW IF EXISTS public.daily_steps_summary CASCADE;
DROP TABLE IF EXISTS public.daily_steps_summary CASCADE;
DROP VIEW IF EXISTS public.heart_rate_summary CASCADE;
DROP TABLE IF EXISTS public.heart_rate_summary CASCADE;
DROP VIEW IF EXISTS public.analytics_country CASCADE;
DROP TABLE IF EXISTS public.analytics_country CASCADE;
DROP VIEW IF EXISTS public.analytics_device CASCADE;
DROP TABLE IF EXISTS public.analytics_device CASCADE;
DROP VIEW IF EXISTS public.analytics_realtime CASCADE;
DROP TABLE IF EXISTS public.analytics_realtime CASCADE;
DROP VIEW IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP VIEW IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP VIEW IF EXISTS public.diary_entries CASCADE;
DROP TABLE IF EXISTS public.diary_entries CASCADE;
DROP VIEW IF EXISTS public.health_raw_data CASCADE;
DROP TABLE IF EXISTS public.health_raw_data CASCADE;
DROP VIEW IF EXISTS public.health_records CASCADE;
DROP TABLE IF EXISTS public.health_records CASCADE;
DROP VIEW IF EXISTS public.logins CASCADE;
DROP TABLE IF EXISTS public.logins CASCADE;
DROP VIEW IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP VIEW IF EXISTS public.user_app_status CASCADE;
DROP TABLE IF EXISTS public.user_app_status CASCADE;
DROP VIEW IF EXISTS public.user_data CASCADE;
DROP TABLE IF EXISTS public.user_data CASCADE;

-- 1. Analytics by Country
CREATE TABLE IF NOT EXISTS public.analytics_country (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code text NOT NULL,
    country_name text,
    visitor_count integer DEFAULT 0,
    last_updated timestamptz DEFAULT now(),
    UNIQUE(country_code)
);

-- 2. Analytics by Device
CREATE TABLE IF NOT EXISTS public.analytics_device (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_type text NOT NULL, -- mobile, desktop, tablet
    browser text,
    os text,
    visitor_count integer DEFAULT 0,
    last_updated timestamptz DEFAULT now()
);

-- 3. Realtime Analytics (Active Sessions)
CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text UNIQUE NOT NULL,
    path text,
    last_activity timestamptz DEFAULT now()
);

-- 4. Articles (CMS)
CREATE TABLE IF NOT EXISTS public.articles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    content text,
    author_id uuid REFERENCES auth.users(id),
    category text,
    is_published boolean DEFAULT false,
    published_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Chat Messages (Support/Community)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 6. Daily Summaries
CREATE TABLE IF NOT EXISTS public.daily_sleep_summary (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    avg_score integer,
    total_duration_min integer,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.daily_steps_summary (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    steps_count integer DEFAULT 0,
    distance_meters numeric DEFAULT 0,
    calories_burned numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- 7. Diary Entries
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    content text,
    mood text,
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 8. Health Data
CREATE TABLE IF NOT EXISTS public.health_raw_data (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    source text, -- apple_health, google_fit, etc.
    data_type text NOT NULL,
    payload jsonb NOT NULL,
    recorded_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    record_type text NOT NULL, -- heart_rate, blood_pressure, etc.
    value numeric NOT NULL,
    unit text,
    recorded_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.heart_rate_summary (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    min_hr integer,
    max_hr integer,
    avg_hr integer,
    resting_hr integer,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- 9. Logins (Successful Logins)
CREATE TABLE IF NOT EXISTS public.logins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address text,
    user_agent text,
    login_at timestamptz DEFAULT now()
);

-- 10. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id text UNIQUE,
    plan_id text NOT NULL,
    status text NOT NULL, -- active, canceled, past_due, etc.
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 11. User App Status
CREATE TABLE IF NOT EXISTS public.user_app_status (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_seen timestamptz DEFAULT now(),
    is_online boolean DEFAULT false,
    current_version text,
    onboarding_completed boolean DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

-- 12. General User Data
CREATE TABLE IF NOT EXISTS public.user_data (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    key text NOT NULL,
    value jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_device ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sleep_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_steps_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heart_rate_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_app_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Admin Policies
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'analytics_country', 'analytics_device', 'analytics_realtime', 
        'articles', 'chat_messages', 'daily_sleep_summary', 
        'daily_steps_summary', 'diary_entries', 'health_raw_data', 
        'health_records', 'heart_rate_summary', 'logins', 
        'subscriptions', 'user_app_status', 'user_data'
    ];
BEGIN
    FOR t IN SELECT unnest(tables)
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Admin full access" ON public.%I;
            CREATE POLICY "Admin full access" ON public.%I
            FOR ALL TO authenticated
            USING (public.is_admin_check(auth.uid()));
        ', t, t);
    END LOOP;
END $$;

-- User Policies (Self Access)
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
    FOR ALL TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can manage own daily sleep summary" ON public.daily_sleep_summary
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily steps summary" ON public.daily_steps_summary
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diary entries" ON public.diary_entries
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health raw data" ON public.health_raw_data
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health records" ON public.health_records
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own heart rate summary" ON public.heart_rate_summary
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read own logins" ON public.logins
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own app status" ON public.user_app_status
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data" ON public.user_data
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- Public Policies
CREATE POLICY "Anyone can read published articles" ON public.articles
    FOR SELECT TO anon, authenticated
    USING (is_published = true);

-- RPC Functions for Analytics
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

-- Add unique constraint for analytics_device to support ON CONFLICT
ALTER TABLE public.analytics_device DROP CONSTRAINT IF EXISTS analytics_device_unique_key;
ALTER TABLE public.analytics_device ADD CONSTRAINT analytics_device_unique_key UNIQUE (device_type, browser, os);
