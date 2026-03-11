import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ChevronLeft, Trash2 } from 'lucide-react';
import { startContextualCoach } from '../services/geminiService';
import { SleepRecord } from '../types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIAssistantProps {
  lang: 'en' | 'zh';
  data: SleepRecord | null;
  history: SleepRecord[];
  onBack?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, history, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      chatHistory.push({ role: 'user', content: input });

      const stream = await startContextualCoach(chatHistory, history, lang);
      
      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        const text = chunk.text || '';
        assistantContent += text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantContent;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: lang === 'zh' ? '抱歉，神经连接出现故障。请稍后再试。' : 'Sorry, the neural link failed. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Bot className="text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-white">{lang === 'zh' ? 'AI 睡眠官' : 'AI Sleep Officer'}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Neural Link Active</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Sparkles className="text-indigo-400/50" size={32} />
            </div>
            <h3 className="text-white font-medium mb-2">{lang === 'zh' ? '欢迎来到神经核心' : 'Welcome to the Neural Core'}</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              {lang === 'zh' ? '我是您的首席研究官。您可以询问关于睡眠数据、优化建议或生理模式的任何问题。' : 'I am your Chief Research Officer. Ask me anything about your sleep data, optimization protocols, or biological patterns.'}
            </p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' ? 'bg-slate-800 border-slate-700' : 'bg-indigo-500/20 border-indigo-500/30'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="text-slate-400" /> : <Bot size={14} className="text-indigo-400" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-950/50 text-slate-300 border border-slate-800 rounded-tl-none'
                }`}>
                  {msg.content || (isLoading && idx === messages.length - 1 ? <div className="flex gap-1"><div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" /><div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" /></div> : null)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950/50 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'zh' ? '输入指令...' : 'Enter command...'}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:text-slate-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center uppercase tracking-widest font-mono">
          Neural Handshake Protocol v4.0
        </p>
      </div>
    </div>
  );
};
