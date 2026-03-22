import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, logAuditLog } from '../services/supabaseService';
import { SleepRecord } from '../types';
import { Send, User, Bot, Loader2, Paperclip, X, AlertTriangle, Mic, MicOff } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const PersonalChat: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, fileData?: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [sleepData, setSleepData] = useState<SleepRecord[]>([]);
  const [labData, setLabData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DAILY_LIMIT = profile?.subscription_plan === 'unlimited' ? Infinity : 4;

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'zh-CN';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSleepData();
      fetchMessages();
      fetchLabData();
      fetchDailyCount();
    }
  }, [user]);

  const fetchDailyCount = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', today.toISOString());

    if (!error && count !== null) {
      setDailyCount(count);
    }
  };

  const fetchLabData = () => {
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setLabData(parsed);
      } catch (e) {
        console.error('Failed to parse lab data', e);
      }
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error: _ } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map((m: any) => ({ role: m.role as 'user' | 'model', content: m.content })));
    }
  };

  const saveMessage = async (role: 'user' | 'model', content: string) => {
    if (!user) return;
    const { error } = await supabase.from('chat_messages').insert([{ user_id: user.id, role, content }]);
    if (!error) await logAuditLog(user.id, 'SAVE_CHAT_MESSAGE', { role, contentLength: content.length });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setSelectedFile({
        name: file.name,
        data: base64Data.split(',')[1],
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const fetchSleepData = async () => {
    if (!user) return;
    const { data, error: _ } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (data) {
      setSleepData(data.map((d: any) => ({
        id: d.id,
        date: d.date,
        score: d.score || 0,
        heartRate: {
          resting: d.heart_rate_resting || 60,
          min: d.heart_rate_min || 50,
          max: d.heart_rate_max || 100,
          average: d.heart_rate_avg || 70,
          history: d.heart_rate_history || []
        },
        deepRatio: d.deep_ratio || 0.2,
        remRatio: d.rem_ratio || 0.2,
        totalDuration: d.total_duration || 480,
        efficiency: d.efficiency || 0.9,
        stages: d.stages || [],
        aiInsights: d.ai_insights || []
      })));
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || loading) return;
    
    if (dailyCount >= DAILY_LIMIT) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "您已达到每日 4 次分析限制。我们设置此限制是为了确保系统稳定性并避免超出每日配额。请明天再试！" 
      }]);
      return;
    }

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage('user', input + (selectedFile ? ` [Attached File: ${selectedFile.name}]` : ''));
    
    const currentInput = input;
    const currentFile = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setLoading(true);
    setDailyCount(prev => prev + 1);

    try {
      const today = new Date().toISOString().split('T')[0];
      const todayLabRecords = labData.filter(r => r.date.startsWith(today));
      
      const systemInstruction = `You are a personal AI sleep coach. 
      You have access to the user's detailed sleep records from the Lab (saved today): ${JSON.stringify(todayLabRecords)}.
      You also have access to recent historical sleep data: ${JSON.stringify(sleepData)}.
      Provide personalized, empathetic, and scientifically-backed advice based on this data. 
      If the user asks about their data from today, refer to the Lab records.
      You can also analyze uploaded images or documents related to sleep.`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages,
          currentInput,
          currentFile,
          systemInstruction
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to generate response';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const modelContent = data.text || "I'm sorry, I couldn't generate a response.";
      
      setMessages(prev => [...prev, { role: 'model', content: modelContent }]);
      await saveMessage('model', modelContent);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] p-6 flex flex-col items-center">
      <GlassCard className="w-full max-w-2xl h-[700px] flex flex-col p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Personal Sleep Coach</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Daily Analysis: {dailyCount}/{DAILY_LIMIT}
            </span>
          </div>
        </div>

        {dailyCount >= DAILY_LIMIT && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-200 text-xs">
            <AlertTriangle size={16} />
            <span>您已达到今日限制。请明天再来获取更多分析！</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
              <Bot size={48} className="mb-4 opacity-20" />
              <p className="text-sm italic">"Hello! I'm your AI sleep coach. You can ask me about your sleep data, or upload a screenshot of your sleep report for analysis."</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <Bot className="text-indigo-400 shrink-0 mt-1" size={20} />}
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 text-slate-200 border border-white/10'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && <User className="text-slate-400 shrink-0 mt-1" size={20} />}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-3">
              <Bot className="text-indigo-400 shrink-0 mt-1" size={20} />
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Loader2 className="animate-spin text-indigo-500" size={16} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {selectedFile && (
          <div className="mb-3 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Paperclip size={14} className="text-indigo-400 shrink-0" />
              <span className="text-xs text-indigo-200 truncate">{selectedFile.name}</span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none min-h-[50px] max-h-[150px] text-sm"
              placeholder="Ask about your sleep..."
              rows={1}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button 
                onClick={toggleRecording}
                className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-400'}`}
                title="Voice input"
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                title="Upload file"
              >
                <Paperclip size={18} />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,application/pdf"
            />
          </div>
          <button 
            onClick={sendMessage} 
            disabled={loading || (!input.trim() && !selectedFile)}
            className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
