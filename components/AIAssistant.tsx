
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Binary, MessageSquareText, ShieldAlert, Github } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { ChatMessage } from '../types.ts';
import { chatWithCoach } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "System initialized. I am Somno Chief Research Officer. Biometric streams loaded. I can provide sleep architecture projections or optimization recommendations. Awaiting instructions.",
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
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmedInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyForAi = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await chatWithCoach(historyForAi);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Lab gateway response exception. Try providing more specific biometric signal descriptions.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-6 animate-in fade-in duration-700">
      <header className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] shadow-2xl relative">
            <Logo size={32} animated />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tight text-white">AI Insights Lab</h1>
            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
              <Binary size={10} />
              Session ID: SMN-{Math.floor(Math.random()*10000)}
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-3 mb-1.5">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
              <Github size={12} />
            </a>
            <a href="mailto:ongyuze1401@gmail.com" className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors p-1 bg-indigo-500/5 rounded-md px-2">
              <MessageSquareText size={10} />
              FEEDBACK
            </a>
          </div>
          <div className="px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <span className="text-[8px] font-mono text-indigo-300">CONFIDENCE: 0.98</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 mb-8 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15, scale: 0.98 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-lg ${msg.role === 'assistant' ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-white/5 text-slate-400'}`}>
                  {msg.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}
                </div>
                <div className={`p-5 rounded-[1.75rem] text-[13px] leading-relaxed font-medium shadow-2xl relative ${
                  msg.role === 'assistant' 
                  ? 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none italic' 
                  : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/30'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-indigo-400" />
              </div>
              <div className="p-5 bg-slate-900/40 rounded-[1.75rem] rounded-tl-none border border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      <GlassCard className="p-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            placeholder={isTyping ? "Synthesizing lab instruction..." : "Ask about Deep, REM, or heart rate trends..."}
            className="w-full bg-transparent py-5 pl-6 pr-16 focus:outline-none font-medium text-sm text-white placeholder:text-slate-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3.5 bg-indigo-600 rounded-2xl hover:bg-indigo-500 disabled:opacity-20 transition-all active:scale-90 shadow-xl shadow-indigo-600/20"
          >
            {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </GlassCard>
      
      <div className="mt-4 flex items-center justify-center gap-2 opacity-20">
        <ShieldAlert size={10} />
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Encrypted AI Sandbox • Local Processing Enabled</span>
      </div>
    </div>
  );
};
