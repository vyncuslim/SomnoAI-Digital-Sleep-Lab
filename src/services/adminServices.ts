import { supabaseAdmin } from './supabaseAdmin';
import { auditLogger } from './auditLog';

export const adminServices = {
  async deleteUser(adminUserId: string, targetUserId: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    await auditLogger.logAdmin({
      source: 'admin_panel',
      level: error ? 'error' : 'warning',
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
      .update({ is_blocked: true, block_code: params.reason })
      .eq('id', params.targetUserId);

    await auditLogger.logAdmin({
      source: 'admin_panel',
      level: error ? 'error' : 'warning',
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
      .update({ is_blocked: false, block_code: null })
      .eq('id', params.targetUserId);

    await auditLogger.logAdmin({
      source: 'admin_panel',
      level: error ? 'error' : 'info',
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
  },

  async updateUserRole(params: {
    adminUserId: string;
    targetUserId: string;
    newRole: string;
  }) {
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('role, is_super_owner')
      .eq('id', params.targetUserId)
      .single();

    const oldRole = targetUser?.is_super_owner ? 'super_owner' : (targetUser?.role || 'user');

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role: params.newRole, is_super_owner: params.newRole === 'super_owner' })
      .eq('id', params.targetUserId);

    await auditLogger.logAdmin({
      source: 'admin_panel',
      level: error ? 'error' : 'info',
      action: 'update_user_role',
      status: error ? 'failed' : 'success',
      actorUserId: params.adminUserId,
      targetUserId: params.targetUserId,
      errorCode: error?.code ?? null,
      message: error ? 'Admin failed to update user role' : 'Admin updated user role',
      metadata: { oldRole, newRole: params.newRole },
    });

    if (error) throw error;
    return { success: true };
  }
};
