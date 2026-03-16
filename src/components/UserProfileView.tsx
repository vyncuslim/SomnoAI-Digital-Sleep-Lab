import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Globe, Settings, Save, Edit2, X, CheckCircle2, AlertCircle,
  Calendar, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language, UserProfile } from '../types';
import { userApi, logAuditLog, supabase } from '../services/supabaseService';
import { GlassCard } from './GlassCard';

interface UserProfileViewProps {
  lang: Language;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ lang }) => {
  const { profile, user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    
    setIsUploading(true);
    setMessage(null);
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await userApi.updateProfile(user.id, { avatar_url: publicUrl });
      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({
        type: 'success',
        text: lang === 'zh' ? '头像已更新' : 'Avatar updated successfully'
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setMessage({
        type: 'error',
        text: lang === 'zh' ? '上传失败: ' + error.message : 'Upload failed: ' + error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await userApi.updateProfile(user.id, formData);
      if (error) throw error;

      await logAuditLog(user.id, 'UPDATE_PROFILE', formData);
      await refreshProfile();
      
      setMessage({
        type: 'success',
        text: lang === 'zh' ? '资料已成功更新' : 'Profile updated successfully'
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: lang === 'zh' ? '更新失败: ' + error.message : 'Update failed: ' + error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const t = {
    title: lang === 'zh' ? '个人资料' : 'User Profile',
    personalInfo: lang === 'zh' ? '个人信息' : 'Personal Information',
    fullName: lang === 'zh' ? '全名' : 'Full Name',
    email: lang === 'zh' ? '电子邮箱' : 'Email Address',
    phone: lang === 'zh' ? '电话号码' : 'Phone Number',
    country: lang === 'zh' ? '国家/地区' : 'Country/Region',
    memberSince: lang === 'zh' ? '加入时间' : 'Member Since',
    settings: lang === 'zh' ? '偏好设置' : 'Preferences',
    subscription: lang === 'zh' ? '订阅详情' : 'Subscription Details',
    plan: lang === 'zh' ? '当前方案' : 'Current Plan',
    status: lang === 'zh' ? '状态' : 'Status',
    manageSub: lang === 'zh' ? '管理订阅' : 'Manage Subscription',
    active: lang === 'zh' ? '已激活' : 'Active',
    free: lang === 'zh' ? 'Go版' : 'Go',
    pro: lang === 'zh' ? 'SomnoAI 数字睡眠实验室分析' : 'SomnoAI Digital Sleep Lab Analysis',
    edit: lang === 'zh' ? '编辑资料' : 'Edit Profile',
    save: lang === 'zh' ? '保存更改' : 'Save Changes',
    cancel: lang === 'zh' ? '取消' : 'Cancel',
    placeholderName: lang === 'zh' ? '未设置' : 'Not set'
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
            {t.title}
          </h1>
          <p className="text-slate-400 font-medium">
            {lang === 'zh' ? '管理您的帐户设置和偏好。' : 'Manage your account settings and preferences.'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Edit2 className="w-4 h-4" />
            {t.edit}
          </button>
        )}
      </div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-black italic uppercase tracking-widest text-white">{t.personalInfo}</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-white/10">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User size={48} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                  </label>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.fullName}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-lg font-medium text-white">{profile.full_name || t.placeholderName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.email}</label>
                  <p className="text-lg font-medium text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.phone}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-lg font-medium text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      {profile.phone || t.placeholderName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.country}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-lg font-medium text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      {profile.country || t.placeholderName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Meta */}
        <div className="space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-black italic uppercase tracking-widest text-white">{t.subscription}</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.plan}</label>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white italic">
                    {profile.subscription_plan?.toLowerCase() === 'pro' ? t.pro : t.free}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    profile.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {profile.subscription_status === 'active' ? t.active : profile.subscription_status || 'FREE'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/pricing'}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {t.manageSub}
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.memberSince}</label>
                <div className="flex items-center gap-3 text-white">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">
                    {new Date(profile.created_at || '').toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  {lang === 'zh' 
                    ? '您的数据根据我们的隐私政策进行加密和保护。' 
                    : 'Your data is encrypted and protected according to our privacy policy.'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Action Bar (Sticky when editing) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
          >
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/40"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t.save}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
