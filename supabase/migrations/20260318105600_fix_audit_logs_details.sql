
-- Fix write_audit_log to populate details for backward compatibility
DROP FUNCTION IF EXISTS public.write_audit_log(text, text, text, text, text, uuid, uuid, text, text, text, text, text, text, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_source text DEFAULT 'system',
  p_level text DEFAULT 'info',
  p_category text DEFAULT 'system',
  p_action text DEFAULT 'unknown',
  p_status text DEFAULT 'success',
  p_actor_user_id uuid DEFAULT null,
  p_target_user_id uuid DEFAULT null,
  p_session_id text DEFAULT null,
  p_request_id text DEFAULT null,
  p_ip_address text DEFAULT null,
  p_user_agent text DEFAULT null,
  p_path text DEFAULT null,
  p_method text DEFAULT null,
  p_error_code text DEFAULT null,
  p_message text DEFAULT null,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    source, level, category, action, status, 
    user_id, target_user_id, session_id, request_id, 
    ip_address, user_agent, path, method, 
    error_code, message, metadata, details
  )
  VALUES (
    p_source, p_level, p_category, p_action, p_status, 
    p_actor_user_id, p_target_user_id, p_session_id, p_request_id, 
    p_ip_address, p_user_agent, p_path, p_method, 
    p_error_code, p_message, p_metadata, p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
