import { logError } from './supabaseService';
import { supabase } from './supabaseService';

export const fetchWithLogging = async (url: string, options: RequestInit = {}, context: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'CRITICAL') => {
  try {
    // Automatically add Authorization header if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(options.headers);
    if (session?.access_token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const { data: { user } } = await supabase.auth.getUser();
      await logError(
        user?.id || null,
        `Status: ${response.status}, Error: ${JSON.stringify(errorData)}`,
        `URL: ${url}, Context: ${context}`,
        severity
      );
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response;
  } catch (error) {
    const { data: { user } } = await supabase.auth.getUser();
    await logError(
      user?.id || null,
      error,
      `URL: ${url}, Context: ${context}`,
      severity
    );
    throw error;
  }
};
