
-- ==========================================
-- SOMNOAI ANALYTICS HUB UPGRADE
-- ==========================================

-- 1. Enhanced Daily Analytics (History & Distributions)
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    date date PRIMARY KEY,
    users integer DEFAULT 0,
    sessions integer DEFAULT 0,
    pageviews integer DEFAULT 0,
    -- JSONB for flexible ranking data: { "countries": {"US": 10, "CN": 5}, "devices": {"mobile": 12, "desktop": 3}, "sources": {"google": 8, "direct": 7} }
    distribution jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 2. Real-time Metrics (High-frequency sampling)
CREATE TABLE IF NOT EXISTS public.analytics_realtime (
    id bigserial PRIMARY KEY,
    timestamp timestamptz DEFAULT now(),
    active_users integer DEFAULT 0,
    sessions_last_hour integer DEFAULT 0,
    pageviews_last_hour integer DEFAULT 0
);

-- Index for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_analytics_realtime_timestamp ON public.analytics_realtime (timestamp DESC);

-- 3. Security Policies for Analytics Node
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_realtime ENABLE ROW LEVEL SECURITY;

-- Shared Admin View Policy
CREATE POLICY "Admins can view daily analytics" ON public.analytics_daily
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

CREATE POLICY "Admins can view realtime analytics" ON public.analytics_realtime
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)));

-- Maintenance: Auto-purge old realtime data (older than 48 hours) to keep DB lean
CREATE OR REPLACE FUNCTION public.purge_old_realtime_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM public.analytics_realtime WHERE timestamp < now() - interval '48 hours';
END;
$$;
