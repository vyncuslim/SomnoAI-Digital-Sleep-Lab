
import { supabase } from './supabaseService.ts';
import { notifyAdmin } from './telegramService.ts';

/**
 * SOMNO LAB NEURAL PULSE MONITOR v1.1
 * Enhanced for Multi-Language Global Reporting
 */

export interface DiagnosticResult {
  isSuccess: boolean;
  message: string;
  latency: number;
  details: {
    database: boolean;
    auth: boolean;
    environment: boolean;
  };
}

export const systemMonitor = {
  /**
   * Executes a single diagnostic sweep and dispatches notifications 
   * in English, Spanish, and Chinese to the administrative gateway.
   */
  executeGlobalPulseCheck: async (): Promise<DiagnosticResult> => {
    const startTime = performance.now();
    const result: DiagnosticResult = {
      isSuccess: true,
      message: '',
      latency: 0,
      details: { database: false, auth: false, environment: false }
    };

    try {
      // 1. Check Database Ingress
      const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
      result.details.database = !dbError;
      
      // 2. Check Auth Bridge
      const { data: { session } } = await (supabase.auth as any).getSession();
      result.details.auth = !!session;

      // 3. Check Critical Environment Keys
      result.details.environment = !!process.env.API_KEY || !!localStorage.getItem('custom_gemini_key');

      const endTime = performance.now();
      result.latency = Math.round(endTime - startTime);

      if (!result.details.database) {
        result.isSuccess = false;
        result.message = "DB_LINK_SEVERED: Unable to ping registry.";
      } else if (!result.details.environment) {
        result.isSuccess = false;
        result.message = "NEURAL_LINK_OFFLINE: API keys missing from host.";
      } else {
        result.message = "ALL_SYSTEMS_NOMINAL";
      }

      // Dispatch to Telegram in three languages
      const languages: ('en' | 'es' | 'zh')[] = ['en', 'es', 'zh'];
      
      // We send them sequentially to avoid Telegram rate limits for the same chat ID
      for (const lang of languages) {
        await notifyAdmin({
          isPulse: true,
          isSuccess: result.isSuccess,
          message: result.message,
          latency: result.latency.toString()
        }, lang);
      }

      return result;
    } catch (e: any) {
      result.isSuccess = false;
      result.message = `HANDSHAKE_TIMEOUT: ${e.message}`;
      
      const languages: ('en' | 'es' | 'zh')[] = ['en', 'es', 'zh'];
      for (const lang of languages) {
        await notifyAdmin({
          isPulse: true,
          isSuccess: false,
          message: result.message,
          latency: "--"
        }, lang);
      }

      return result;
    }
  },

  /**
   * Legacy single-language check
   */
  executePulseCheck: async (lang: 'en' | 'zh' | 'es' = 'en'): Promise<DiagnosticResult> => {
    const startTime = performance.now();
    const result: DiagnosticResult = {
      isSuccess: true,
      message: '',
      latency: 0,
      details: { database: false, auth: false, environment: false }
    };

    try {
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
      result.details.database = !error;
      const { data: { session } } = await (supabase.auth as any).getSession();
      result.details.auth = !!session;
      result.details.environment = !!process.env.API_KEY || !!localStorage.getItem('custom_gemini_key');
      const endTime = performance.now();
      result.latency = Math.round(endTime - startTime);

      if (!result.details.database) {
        result.isSuccess = false;
        result.message = "DB_LINK_SEVERED";
      } else if (!result.details.environment) {
        result.isSuccess = false;
        result.message = "ENV_KEYS_MISSING";
      } else {
        result.message = "OK";
      }

      await notifyAdmin({
        isPulse: true,
        isSuccess: result.isSuccess,
        message: result.message,
        latency: result.latency.toString()
      }, lang);

      return result;
    } catch (e: any) {
      result.isSuccess = false;
      result.message = e.message;
      return result;
    }
  }
};
