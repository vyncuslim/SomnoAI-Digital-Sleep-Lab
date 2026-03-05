import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Card } from './ui/Components';
import { Shield, User, Lock, Unlock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Unblock
      const { error } = await supabase.from('profiles').update({ is_blocked: false }).eq('id', userId);
      if (error) console.error('Error unblocking user:', error);
    } else {
      // Block
      const { error } = await supabase.rpc('block_user', { user_id: userId });
      if (error) console.error('Error blocking user:', error);
    }
    // Refresh list
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error) setUsers(data || []);
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Admin User Management</h2>
      <div className="grid grid-cols-1 gap-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-xl text-white">
            <div>
              <p className="font-bold">{user.full_name || 'No Name'}</p>
              <p className="text-sm text-slate-400">{user.email} | Role: {user.role}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded text-xs ${user.is_blocked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {user.is_blocked ? 'Blocked' : 'Active'}
              </span>
              <button 
                onClick={() => toggleBlock(user.id, user.is_blocked)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {user.is_blocked ? <Unlock size={18} /> : <Lock size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
