import { logError } from './supabaseService';
import { supabase } from './supabaseService';

export const fetchWithLogging = async (url: string, options: RequestInit = {}, context: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'CRITICAL') => {
  try {
    const response = await fetch(url, options);
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
