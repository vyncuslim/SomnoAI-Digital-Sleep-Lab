import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

const getAi = () => {
  let apiKey = "DUMMY_KEY"; // 默认占位符，防止构造函数由于 undefined 崩溃
  try {
    const env = (window as any).process?.env || (typeof process !== 'undefined' ? process.env : {});
    apiKey = env.API_KEY || "DUMMY_KEY";
  } catch (e) {
    console.warn("SomnoAI: Could not read API key");
  }

  return new GoogleGenAI({ apiKey: apiKey });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAi();
    // 检查是否为有效 Key，否则直接返回回退文本
    if (!(window as any).process?.env?.API_KEY && (typeof process === 'undefined' || !process.env.API_KEY)) {
      return "实验室正在校准您的睡眠节奏。规律作息有助于身心修复。";
    }

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
    const response = await chat.sendMessage({ message: history[history.length - 1].content });
    return response.text || "收到，我正在分析您的疑惑。";
  } catch (error) {
    return "实验室连接稍有延迟，建议稍后再试。";
  }
};