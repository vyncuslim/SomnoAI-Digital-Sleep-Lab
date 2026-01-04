
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this sleep data and provide a concise insight in English (under 20 words):
    Score: ${data.score}, Duration: ${data.totalDuration}min, 
    Deep: ${data.deepRatio}%, REM: ${data.remRatio}%, Heart Rate: ${data.heartRate?.resting || 65}bpm.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Maintaining a regular sleep schedule is key to improving quality.";
  } catch (error: any) {
    console.error("Sleep Insight AI Error:", error);
    return "Analyzing system data. Dimming lights an hour before bed is recommended.";
  }
};

export const getWeeklySummary = async (history: SleepRecord[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");
    if (history.length === 0) return "No history data available.";

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Summarize the sleep historical trends in concise English: ${JSON.stringify(history.map(h => ({ score: h.score, date: h.date })))}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Trend analysis shows your sleep quality is within a stable range.";
  } catch (error) {
    console.error("Weekly Summary AI Error:", error);
    return "Unable to generate trend summary. Ensure sufficient sampling data.";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = "You are the Chief Research Officer of Somno Lab. You are calm, professional, and rigorous. Respond to user sleep inquiries in concise English. If input is vague, guide the user to provide more details.";
    const lastUserMessage = history[history.length - 1].content;
    
    const historyText = history.slice(0, -1).map(m => `${m.role === 'user' ? 'User' : 'CRO'}: ${m.content}`).join('\n');
    const fullPrompt = `${systemInstruction}\n\nContext:\n${historyText}\n\nCurrent User Message: ${lastUserMessage}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: { 
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    return response.text || "Received instruction. Signal input is weak; please provide more details about your sleep experience.";
  } catch (error: any) {
    console.error("AI Coach Error Details:", error);
    if (error.message === "API_KEY_MISSING") {
      return "Lab key not ready. Check environment variables or API config.";
    }
    return "Lab gateway exception. This often occurs when input signals are too short for the AI engine to construct a valid parsing graph.";
  }
};
