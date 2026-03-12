import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseService';
import { SleepRecord } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const PersonalChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sleepData, setSleepData] = useState<SleepRecord[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchSleepData();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!input.trim() || loading) return;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'model', content: "Error: Gemini API key is missing. Please contact support." }]);
      return;
    }
    const ai = new GoogleGenAI({ apiKey });

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('API Key exists:', !!(process.env.GEMINI_API_KEY || process.env.API_KEY));
      const systemInstruction = `You are a personal AI sleep coach. You have access to the user's recent sleep data: ${JSON.stringify(sleepData)}. Provide personalized, empathetic, and scientifically-backed advice based on this data.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
        }
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] p-6 flex flex-col items-center">
      <GlassCard className="w-full max-w-2xl h-[600px] flex flex-col p-6">
        <h2 className="text-xl font-bold text-white mb-4">Personal Sleep Coach</h2>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <Bot className="text-indigo-400" />}
              <div className={`p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-200'}`}>
                {msg.content}
              </div>
              {msg.role === 'user' && <User className="text-slate-400" />}
            </div>
          ))}
          {loading && <Loader2 className="animate-spin text-indigo-500" />}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
            placeholder="Ask about your sleep..."
          />
          <button onClick={sendMessage} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500">
            <Send size={20} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
