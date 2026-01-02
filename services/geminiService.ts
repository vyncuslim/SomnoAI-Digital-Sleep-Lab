import { GoogleGenAI } from "@google/genai";
import { SleepRecord } from "../types.ts";

const getAi = () => {
  let apiKey = "";
  try {
    // 采用级联探测方式获取 API_KEY，防止 process 未定义导致的崩溃
    const env = (typeof process !== 'undefined' && process.env) 
      ? process.env 
      : (window as any).process?.env;
    
    apiKey = env?.API_KEY || "";
  } catch (e) {
    console.warn("AI Loader: Environment detection failed.");
  }

  if (!apiKey) {
    // 即使缺少 KEY 也不抛出同步错误，交由 generateContent 异步处理，防止 UI 渲染中断
    console.error("SomnoAI: Missing API_KEY in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const getSleepInsight = async (data: SleepRecord): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
      As a professional sleep lab scientist, analyze:
      - Sleep Score: ${data.score}/100
      - Total Time: ${data.totalDuration}min
      - Deep Sleep: ${data.deepRatio}%, REM: ${data.remRatio}%
      - Resting HR: ${data.heartRate?.resting || 65}bpm
      - Calories: ${data.calories || 0} kcal
      
      Explain the metabolic impact and provide 1 advice in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });

    return response.text || "保持规律的昼夜节律以优化代谢修复。";
  } catch (error: any) {
    return "已捕获生理指标流。请保持规律运动，系统将在下个周期生成深度洞察。";
  }
};

export const getWeeklySummary = async (history: SleepRecord[]): Promise<string> => {
  try {
    if (history.length === 0) return "数据不足，请继续保持监测。";
    const ai = getAi();
    const prompt = `Analyze this history: ${JSON.stringify(history.map(h => ({ d: h.date, s: h.score })))}. Language: Chinese.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "历史分析模块正在校准中。";
  } catch (error: any) {
    return "基于最近的活跃度，建议维持稳定的作息时长。";
  }
};

export const chatWithCoach = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are Somno, a sleep lab scientist. Be professional and empathetic. Language: Chinese.",
      },
    });

    const response = await chat.sendMessage({ message: history[history.length - 1].content });
    return response.text || "我正在分析您的代谢模型。";
  } catch (error: any) {
    return "由于实验云端连接波动，我暂时无法回应。请稍后再试。";
  }
};