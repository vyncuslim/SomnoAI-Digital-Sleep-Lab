
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

/**
 * Robust check for LocalStorage accessibility.
 * In many sandboxed environments (like iframes), accessing localStorage throws a SecurityError.
 */
const checkStorageAvailability = () => {
  try {
    const testKey = '__somno_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn("SomnoAI Auth: LocalStorage is restricted in this environment. Falling back to memory-only session.");
    return false;
  }
};

const storageAvailable = checkStorageAvailability();

/**
 * Core Supabase engine for authentication and biometric data persistence.
 * Configured with enhanced safety for cross-origin and sandboxed environments.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: storageAvailable,
    autoRefreshToken: storageAvailable,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'somno_auth_session',
    // In sandboxed environments, we prefer memory-only fallback handled by the SDK
    // but we explicitly tell it whether to try and persist or not.
  }
});
