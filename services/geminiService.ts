
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";

// Fix: Always use direct access to process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const prompt = `
      As a world-class sleep scientist, provide a single, punchy, and highly actionable sentence of insight based on these metrics:
      Sleep Score: ${data.score}/100
      Total Duration: ${Math.floor(data.totalDuration / 60)}h ${data.totalDuration % 60}m
      Stages: ${data.stages.map(s => `${s.name}: ${s.duration}m`).join(', ')}
      Resting Heart Rate: ${data.heartRate.resting} BPM.
      
      Keep it encouraging and scientific.
    `;

    // Fix: Using correct model gemini-3-flash-preview and ensuring thinkingBudget is set with maxOutputTokens
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for low-latency, short responses
      }
    });

    // Access text property directly
    return response.text || "Listen to your body's rhythm; quality sleep is the foundation of peak performance.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Analyzing your patterns... keep maintaining your consistent schedule.";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      You are Somno, a high-performance Sleep Coach and Biohacking Expert. 
      Your goal is to help users optimize their sleep architecture (Deep, REM, Light stages).
      Use scientific terms like 'circadian rhythm', 'adenosine', 'melatonin', and 'HRV' when appropriate.
      Be empathetic, concise, and professional.
    `;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const lastUserMessage = history[history.length - 1].content;
    const response = await chat.sendMessage({ message: lastUserMessage });
    
    // Access text property directly
    return response.text || "I'm processing that. Could you tell me more about your evening routine?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my knowledge base. Let's try again in a moment.";
  }
};
