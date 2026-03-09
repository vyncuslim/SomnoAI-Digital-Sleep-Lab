import { supabase, logAuditLog } from './supabaseService';
import { emailService } from './emailService';

const generateBlockCode = () => {
  return 'BLOCK-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

export const securityService = {
  /**
   * Handles a failed login attempt by logging it and blocking the user if threshold is reached.
   */
  handleFailedLogin: async (email: string) => {
    try {
      // Report failed login via RPC which handles the logic in the database
      const { error } = await supabase.rpc('report_failed_login', { target_email: email });
      
      if (error) {
        console.error("RPC report_failed_login failed:", error);
      }

      await logAuditLog('SYSTEM', 'FAILED_LOGIN_ATTEMPT', { email });
    } catch (error) {
      console.error("Security service failed to handle login error:", error);
    }
  },

  /**
   * Handles a security violation by logging it and potentially blocking the user.
   */
  handleSecurityViolation: async (userId: string, email: string, type: string, severity: string) => {
    try {
      // Log security event
      await supabase.from('security_events').insert([{
        user_id: userId,
        type,
        details: `Severity: ${severity} | Violation detected.`,
        ip_address: 'AUTO_DETECT'
      }]);
      
      // If critical or high, block the user
      if (severity === 'CRITICAL' || severity === 'HIGH') {
        const blockCode = generateBlockCode();
        await supabase.from('profiles').update({ is_blocked: true, block_code: blockCode }).eq('id', userId);
        await supabase.rpc('block_user', { user_id: userId });
        await emailService.sendBlockNotification(email, `Security violation detected: ${type}. Your block code is: ${blockCode}`);
      }
      
      await logAuditLog(userId, 'SECURITY_VIOLATION', { type, severity });
    } catch (error) {
      console.error("Security service failed to handle violation:", error);
    }
  },

  /**
   * Unblocks a user and resets their failed login attempts.
   */
  unblockUser: async (userId: string, email: string, reason: string) => {
    try {
      // Update profile status
      await supabase.from('profiles').update({ 
        is_blocked: false, 
        failed_login_attempts: 0,
        block_code: null
      }).eq('id', userId);
      
      // Reset login attempts in the tracking table
      await supabase.rpc('reset_login_attempts', { target_email: email });
      
      await logAuditLog('ADMIN', 'USER_UNBLOCK', { userId, email, reason });
    } catch (error) {
      console.error("Security service failed to unblock user:", error);
    }
  }
};
