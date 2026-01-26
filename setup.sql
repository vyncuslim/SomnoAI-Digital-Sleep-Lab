-- ==========================================
-- SOMNOAI FEEDBACK & SECURITY SCHEMA (V11.0)
-- ==========================================

-- 1. Profiles Table (Existing)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  is_blocked boolean DEFAULT false,
  is_initialized boolean DEFAULT false,
  has_app_data boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Feedback Table (NEW)
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  feedback_type text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Policy Reset for Profiles (Recursion Fix)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

CREATE POLICY "profiles_select_self" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 4. Feedback Policies (Allowing submissions)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_can_submit_feedback" ON public.feedback;
CREATE POLICY "anyone_can_submit_feedback" ON public.feedback FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "admins_can_view_feedback" ON public.feedback;
CREATE POLICY "admins_can_view_feedback" ON public.feedback FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.feedback TO anon;
GRANT INSERT ON public.feedback TO authenticated;

NOTIFY pgrst, 'reload schema';