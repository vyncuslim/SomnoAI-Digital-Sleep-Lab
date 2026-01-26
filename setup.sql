-- ==========================================
-- SOMNOAI CORE INFRASTRUCTURE (V15.0)
-- ==========================================

-- 1. Helper: Admin Check (Fixed recursion-safe version)
-- Using SECURITY DEFINER allows this function to bypass RLS checks 
-- on the profiles table when called inside a policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tables Initialization
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

CREATE TABLE IF NOT EXISTS public.user_data (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  age integer,
  weight decimal,
  height decimal,
  gender text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  feedback_type text NOT NULL, -- 'report', 'suggestion', 'improvement'
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. RLS POLICIES (Recursion-Free)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles 
FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles 
FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Feedback Policies
DROP POLICY IF EXISTS "feedback_insert_public" ON public.feedback;
CREATE POLICY "feedback_insert_public" ON public.feedback 
FOR INSERT WITH CHECK (true); -- Allow anyone to report bugs

DROP POLICY IF EXISTS "feedback_admin_select" ON public.feedback;
CREATE POLICY "feedback_admin_select" ON public.feedback 
FOR SELECT USING (public.is_admin());

-- 5. Permission Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON public.feedback TO anon;

NOTIFY pgrst, 'reload schema';