-- Create log_error function
CREATE OR REPLACE FUNCTION public.log_error(
  p_user_id uuid,
  p_error_message text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_error_stack text DEFAULT NULL,
  p_context text DEFAULT NULL,
  p_severity text DEFAULT 'CRITICAL'
)
RETURNS void AS $$
BEGIN
  -- We use error_logs table as seen in AdminDashboard.tsx
  INSERT INTO public.error_logs (
    user_id,
    error_type,
    message,
    details,
    error_stack,
    context,
    severity
  ) VALUES (
    p_user_id,
    'SYSTEM_ERROR',
    p_error_message,
    p_details,
    p_error_stack,
    p_context,
    p_severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_type text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'INFO'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    type,
    details,
    severity
  ) VALUES (
    p_user_id,
    p_type,
    p_type,
    p_details,
    p_severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure error_logs table exists
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type text,
  message text,
  details jsonb DEFAULT '{}'::jsonb,
  error_stack text,
  context text,
  severity text DEFAULT 'CRITICAL',
  created_at timestamptz DEFAULT now()
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_error(uuid, text, jsonb, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(uuid, text, jsonb, text) TO anon, authenticated;
GRANT ALL ON TABLE public.error_logs TO anon, authenticated;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
