-- Reload schema cache to ensure all columns and functions are recognized
NOTIFY pgrst, 'reload schema';

-- Ensure user_id exists on analytics_realtime just in case
ALTER TABLE public.analytics_realtime ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ensure device_type, browser, os exist on analytics_realtime if needed
-- Actually, analytics_realtime doesn't need device info, that's analytics_device.

-- Ensure get_table_columns exists for the admin dashboard
DROP FUNCTION IF EXISTS public.get_table_columns(text);
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (column_name text, data_type text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::text, c.data_type::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO authenticated;

-- Ensure log_error and log_security_event exist and are accessible
-- (They should be from previous migrations, but let's ensure permissions)
GRANT EXECUTE ON FUNCTION public.log_error(uuid, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(uuid, text, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.write_audit_log(uuid, text, text, jsonb, text) TO anon, authenticated;

-- Reload schema cache again after creating functions
NOTIFY pgrst, 'reload schema';
