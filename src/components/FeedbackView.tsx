import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { Logo } from './Logo';
import { feedbackApi } from '../services/supabaseService';
import { useLanguage } from '../context/useLanguage';

export const FeedbackView: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { success } = await feedbackApi.submitFeedback(type, content, email);
    if (success) {
      setStatus('success');
      setTimeout(() => navigate(-1), 2000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center p-6">
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
      </div>
      <Logo className="mb-8 scale-150" />
      <h1 className="text-3xl font-bold mb-8">{lang === 'zh' ? '反馈与建议' : 'Feedback & Suggestions'}</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{lang === 'zh' ? '反馈类型' : 'Feedback Type'}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50">
            <option value="general">{lang === 'zh' ? '一般建议' : 'General'}</option>
            <option value="bug">{lang === 'zh' ? '报告错误' : 'Bug Report'}</option>
            <option value="feature">{lang === 'zh' ? '功能请求' : 'Feature Request'}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{lang === 'zh' ? '您的反馈' : 'Your Feedback'}</label>
          <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder={lang === 'zh' ? '请描述您的建议...' : 'Describe your suggestion...'} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{lang === 'zh' ? '联系邮箱' : 'Contact Email'}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder="email@example.com" />
        </div>

        <button type="submit" disabled={status === 'submitting'} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          {status === 'submitting' ? (lang === 'zh' ? '提交中...' : 'Submitting...') : <><Send size={18} /> {lang === 'zh' ? '提交反馈' : 'Submit Feedback'}</>}
        </button>

        {status === 'success' && <p className="text-emerald-500 text-center">{lang === 'zh' ? '感谢您的反馈！' : 'Thank you for your feedback!'}</p>}
        {status === 'error' && <p className="text-rose-500 text-center">{lang === 'zh' ? '提交失败，请稍后再试。' : 'Submission failed, please try again later.'}</p>}
      </form>
    </div>
  );
};
