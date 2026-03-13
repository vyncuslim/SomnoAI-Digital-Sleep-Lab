import { supabaseAdmin } from './supabaseAdmin';
import { writeAuditLog } from './auditLog';

export const adminServices = {
  async deleteUser(adminUserId: string, targetUserId: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    await writeAuditLog({
      source: 'admin_panel',
      level: error ? 'error' : 'warning',
      category: 'admin',
      action: 'delete_user',
      status: error ? 'failed' : 'success',
      actorUserId: adminUserId,
      targetUserId,
      errorCode: error?.code ?? null,
      message: error ? 'Admin failed to delete user' : 'Admin deleted user',
      metadata: {},
    });

    if (error) throw error;
    return { success: true };
  },

  async blockUser(params: {
    adminUserId: string;
    targetUserId: string;
    reason: string;
  }) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_blocked: true, blocked_reason: params.reason })
      .eq('id', params.targetUserId);

    await writeAuditLog({
      source: 'admin_panel',
      level: error ? 'error' : 'warning',
      category: 'admin',
      action: 'block_user',
      status: error ? 'failed' : 'success',
      actorUserId: params.adminUserId,
      targetUserId: params.targetUserId,
      errorCode: error?.code ?? null,
      message: error ? 'Admin failed to block user' : 'Admin blocked user',
      metadata: { reason: params.reason },
    });

    if (error) throw error;
    return { success: true };
  },

  async unblockUser(params: {
    adminUserId: string;
    targetUserId: string;
  }) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_blocked: false, blocked_reason: null })
      .eq('id', params.targetUserId);

    await writeAuditLog({
      source: 'admin_panel',
      level: error ? 'error' : 'info',
      category: 'admin',
      action: 'unblock_user',
      status: error ? 'failed' : 'success',
      actorUserId: params.adminUserId,
      targetUserId: params.targetUserId,
      errorCode: error?.code ?? null,
      message: error ? 'Admin failed to unblock user' : 'Admin unblocked user',
      metadata: {},
    });

    if (error) throw error;
    return { success: true };
  }
};
