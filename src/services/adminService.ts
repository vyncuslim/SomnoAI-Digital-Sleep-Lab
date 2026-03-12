import { supabase } from './supabaseService';
import { emailService } from './emailService';
import { logSecurityEvent } from './supabaseService';

export const adminService = {
  blockUser: async (userId: string, reason: string) => {
    try {
      // Generate 12-digit code
      const blockCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_blocked: true, 
          block_code: blockCode, 
          blocked_reason: reason 
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Log the block
      await logSecurityEvent(userId, 'USER_BLOCKED', { reason, blockCode });
      
      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (profile?.email) {
        await emailService.sendBlockNotification(profile.email, reason, blockCode);
      }
      
      return { success: true, blockCode };
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }
};
