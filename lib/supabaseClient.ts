
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojcvvtyaebdodmegwqan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY3Z2dHlhZWJkb2RtZWd3cWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODc2ODgsImV4cCI6MjA4Mzg2MzY4OH0.FJY9V6fdTFOFCXeqWNwv1cQnsnQfq4RZq-5WyLNzPCg';

const getSafeStorage = () => {
  try {
    const testKey = '__somno_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn("SomnoAI Auth: LocalStorage blocked or restricted. Using memory-based persistence.");
    const memoryStorage: Record<string, string> = {};
    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; },
    };
  }
};

/**
 * PRODUCTION ARCHITECTURE - STABLE AUTH PROTOCOL
 * 1. detectSessionInUrl: true (必选项：允许 Supabase 解析 OAuth 回跳令牌)
 * 2. flowType: 'pkce' (推荐用于更安全的现代验证)
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, 
    flowType: 'pkce',
    lock: (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
      return fn();
    }
  }
});
