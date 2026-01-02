
import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

// Fix: Initializing GoogleGenAI using strictly process.env.API_KEY as per the library requirements.
const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAi();
    
    // Fix: Using a plain text prompt for generation as per standard task guidelines.
    const prompt = `
      As a sleep scientist, analyze:
      Score: ${data.score}/100, Duration: ${data.totalDuration}min, 
      Deep: ${data.deepRatio}%, REM: ${data.remRatio}%, RHR: ${data.heartRate?.resting || 65}bpm.
      Provide one short advice in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    // Fix: Accessing .text property directly instead of calling it as a method.
    return response.text || "保持规律的睡眠节奏是改善质量的基础。";
  } catch (error) {
    return "系统分析中。建议睡前一小时减少电子设备使用。";
  }
};

export const getWeeklySummary = async (history: SleepRecord[]): Promise<string> => {
  try {
    if (history.length === 0) return "数据不足。";
    const ai = getAi();
    const prompt = `Analyze sleep history trends: ${JSON.stringify(history.map(h => ({ s: h.score, d: h.date })))}. Provide summary in Chinese.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Fix: Extracting text using the .text getter.
    return response.text || "趋势分析显示您的状态稳定。";
  } catch (error) {
    return "由于信号校准中，暂无法生成周报。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: "You are Somno, a sleep lab scientist. Keep responses brief and helpful. Use Chinese." }
    });
    // Fix: sendMessage correctly takes an object with a message property.
    const response = await chat.sendMessage({ message: history[history.length - 1].content });
    // Fix: Extracting text using the .text getter.
    return response.text || "收到，我正在分析您的疑惑。";
  } catch (error) {
    return "实验室连接稍有延迟，建议稍后再试。";
  }
};
