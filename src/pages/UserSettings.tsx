import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseService';
import { SecuritySettings } from '../components/SecuritySettings';
import { User, Shield, Settings, Bell, Lock } from 'lucide-react';

export const UserSettings: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get('fullName') as string;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 text-sm">Manage your account preferences and security.</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <User className="w-4 h-4" />
          PROFILE
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Lock className="w-4 h-4" />
          SECURITY
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'profile' && (
          <div className="p-8 bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Full Name</label>
                  <input
                    name="fullName"
                    defaultValue={profile?.full_name}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Email Address</label>
                  <input
                    disabled
                    value={profile?.email}
                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-xs font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-8 bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-xl space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Security & Privacy</h2>
            </div>

            <SecuritySettings />

            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Bell className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Security Tip</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your security PIN adds an extra layer of protection to your account. Never share your PIN or recovery key with anyone. SomnoAI staff will never ask for your PIN.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
