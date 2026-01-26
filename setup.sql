-- ==========================================
-- SOMNOAI FEEDBACK INFRASTRUCTURE (V13.0)
-- ==========================================

-- 1. Create Feedback Table if not exists
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  feedback_type text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. DROP old policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;

-- 4. NEW POLICIES: Allow both authenticated AND anonymous users to submit feedback
-- This is critical for Sandbox mode users who aren't logged in.
CREATE POLICY "feedback_insert_policy" ON public.feedback 
FOR INSERT WITH CHECK (true);

CREATE POLICY "feedback_select_admin_policy" ON public.feedback 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Permission grants
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;

NOTIFY pgrst, 'reload schema';