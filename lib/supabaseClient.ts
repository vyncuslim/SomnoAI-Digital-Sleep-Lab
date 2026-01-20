
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

// Detect if localStorage is available (it might be blocked in some sandboxed iframes)
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Core Supabase engine for authentication and biometric data persistence.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: isLocalStorageAvailable(),
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'somno_auth_session'
  }
});
