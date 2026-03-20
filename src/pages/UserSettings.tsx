import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseService';

export const UserSettings: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    <div className="p-4 max-w-md mx-auto bg-slate-900 rounded-xl border border-slate-800 text-white">
      <h2 className="text-xl font-bold mb-4">User Settings</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Full Name</label>
          <input
            name="fullName"
            defaultValue={profile?.full_name}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
        {message && <p className="text-xs text-center mt-2">{message}</p>}
      </form>
    </div>
  );
};
