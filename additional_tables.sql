-- ==========================================
-- ADDITIONAL TABLES FOR SECURITY & LOGGING
-- ==========================================

-- 1. Error Logs Table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    error_message text NOT NULL,
    stack_trace text,
    context text,
    details text,
    created_at timestamptz DEFAULT now()
);

-- 2. Logins Table (for new device detection)
CREATE TABLE IF NOT EXISTS public.logins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    device_info text,
    ip_address text,
    location text,
    status text DEFAULT 'success',
    created_at timestamptz DEFAULT now()
);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logins ENABLE ROW LEVEL SECURITY;

-- Admin can view error logs
DROP POLICY IF EXISTS "Admin view error logs" ON public.error_logs;
CREATE POLICY "Admin view error logs" ON public.error_logs
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

-- Anyone can insert error logs
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Anyone can insert error logs" ON public.error_logs
FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- Admin can view all logins
DROP POLICY IF EXISTS "Admin view all logins" ON public.logins;
CREATE POLICY "Admin view all logins" ON public.logins
FOR SELECT TO authenticated
USING (public.is_admin_check(auth.uid()));

-- Users can view their own logins
DROP POLICY IF EXISTS "Users view own logins" ON public.logins;
CREATE POLICY "Users view own logins" ON public.logins
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Anyone can insert logins (for recording purposes)
DROP POLICY IF EXISTS "Anyone can insert logins" ON public.logins;
CREATE POLICY "Anyone can insert logins" ON public.logins
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now()
);

-- 5. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    type text NOT NULL,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- 6. RLS Policies for Reviews and Feedback
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 7. Missing Tables
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    users int DEFAULT 0,
    sessions int DEFAULT 0,
    clicks int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    type text NOT NULL,
    subject text,
    content text,
    status text DEFAULT 'sent',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sleep_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    score int,
    heart_rate_resting int,
    heart_rate_min int,
    heart_rate_max int,
    heart_rate_avg int,
    heart_rate_history jsonb,
    deep_ratio float,
    rem_ratio float,
    total_duration int,
    efficiency float,
    stages jsonb,
    ai_insights jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diary_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    content text,
    mood text,
    tags text[],
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Admin can manage all
CREATE POLICY "Admin manage analytics" ON public.analytics_daily FOR ALL TO authenticated USING (public.is_admin_check(auth.uid()));
CREATE POLICY "Admin manage communications" ON public.communications FOR ALL TO authenticated USING (public.is_admin_check(auth.uid()));
CREATE POLICY "Admin manage sleep_records" ON public.sleep_records FOR ALL TO authenticated USING (public.is_admin_check(auth.uid()));
CREATE POLICY "Admin manage diary_entries" ON public.diary_entries FOR ALL TO authenticated USING (public.is_admin_check(auth.uid()));

-- Users can view own data
CREATE POLICY "Users view own sleep_records" ON public.sleep_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sleep_records" ON public.sleep_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own diary_entries" ON public.diary_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diary_entries" ON public.diary_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. Ensure profiles has is_blocked
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked_reason text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_attempts int DEFAULT 0;

-- Public can read reviews
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews
FOR SELECT TO anon, authenticated
USING (true);

-- Authenticated users can insert reviews
DROP POLICY IF EXISTS "Users insert reviews" ON public.reviews;
CREATE POLICY "Users insert reviews" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin can manage reviews
DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
CREATE POLICY "Admin manage reviews" ON public.reviews
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()));

-- Users can view their own feedback
DROP POLICY IF EXISTS "Users view own feedback" ON public.feedback;
CREATE POLICY "Users view own feedback" ON public.feedback
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can insert feedback
DROP POLICY IF EXISTS "Users insert feedback" ON public.feedback;
CREATE POLICY "Users insert feedback" ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin can manage feedback
DROP POLICY IF EXISTS "Admin manage feedback" ON public.feedback;
CREATE POLICY "Admin manage feedback" ON public.feedback
FOR ALL TO authenticated
USING (public.is_admin_check(auth.uid()));
