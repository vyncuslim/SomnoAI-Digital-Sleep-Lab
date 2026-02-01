
-- ==========================================
-- GA4 TELEMETRY MIRROR TABLES (V9.1)
-- ==========================================

-- 1. Daily Traffic Statistics
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    date date PRIMARY KEY,
    users integer DEFAULT 0,
    sessions integer DEFAULT 0,
    pageviews integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 2. Geographic Distribution
CREATE TABLE IF NOT EXISTS public.analytics_country (
    country text PRIMARY KEY,
    users integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3. Device Segmentation
CREATE TABLE IF NOT EXISTS public.analytics_device (
    device_category text PRIMARY KEY,
    users integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 4. Realtime Pulse (Temporary buffer)
CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    active_users integer DEFAULT 0,
    recorded_at timestamptz DEFAULT now()
);

-- ==========================================
-- SECURITY & RLS CONFIGURATION
-- ==========================================

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_device ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;

-- POLICY: Admins and Owners can READ all analytics
DROP POLICY IF EXISTS "Admin Read Analytics Daily" ON public.analytics_daily;
CREATE POLICY "Admin Read Analytics Daily" ON public.analytics_daily
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

DROP POLICY IF EXISTS "Admin Read Analytics Country" ON public.analytics_country;
CREATE POLICY "Admin Read Analytics Country" ON public.analytics_country
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

DROP POLICY IF EXISTS "Admin Read Analytics Device" ON public.analytics_device;
CREATE POLICY "Admin Read Analytics Device" ON public.analytics_device
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- POLICY: Service Role / API Sync can UPSERT (Implicitly handled by Bypass RLS in Vercel if using Service Key)
-- But we add an explicit permission for robustness if using Anon key with specific headers
