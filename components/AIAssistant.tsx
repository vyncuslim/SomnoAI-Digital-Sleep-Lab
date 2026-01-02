import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Binary, ShieldCheck, Microscope } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { motion } from 'framer-motion';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "系统就绪。我是 SomnoAI 首席科研官。我可以为您进行睡眠架构推演，或回答基于生理特征流的健康疑问。请下达指令。",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await chatWithCoach([...messages, userMsg].map(m => ({ 
        role: m.role, 
        content: m.content + " (请以冷静、专业的睡眠科学家口吻回答，尽量简短)" 
      })));
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-6">
      <header className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl shadow-xl">
            <Microscope size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tight">AI 洞察实验室</h1>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Somno-v3 引擎在线
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">置信等级</p>
          <p className="text-xs font-mono text-emerald-500 font-bold">HIGH (0.98)</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${msg.role === 'assistant' ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-white/5 text-slate-400'}`}>
                {msg.role === 'assistant' ? <Sparkles size={14} /> : <User size={14} />}
              </div>
              <div className={`p-4 rounded-[1.5rem] text-[13px] leading-relaxed font-medium ${msg.role === 'assistant' ? 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none italic' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
              </div>
              <div className="p-4 bg-white/5 rounded-[1.5rem] rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="relative group">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="输入指令，如：‘分析昨晚深睡偏低原因’"
          className="w-full bg-[#0f172a]/60 border border-white/5 rounded-2xl py-5 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 backdrop-blur-xl transition-all font-medium text-sm text-white placeholder:text-slate-600"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-30 transition-all active:scale-90"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
