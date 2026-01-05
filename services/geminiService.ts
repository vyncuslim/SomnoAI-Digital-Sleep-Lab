
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a high-precision multi-dimensional sleep analysis. 
    Output exactly 3 distinct insights in ${lang === 'zh' ? 'Chinese' : 'English'}:
    1. A physiological signal analysis (Deep/REM architecture).
    2. A cognitive/psychological impact projection.
    3. A tactical bio-hack or recommendation for today.
    
    Data: Score ${data.score}, Deep ${data.deepRatio}%, REM ${data.remRatio}%, Efficiency ${data.efficiency}%, RHR ${data.heartRate?.resting}bpm.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A concise sleep insight under 25 words."
          }
        }
      }
    });

    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (err: any) {
    console.error("Gemini Insight Error:", err);
    return lang === 'en' 
      ? ["Insight synthesis offline.", "Biometric link stable.", "Awaiting next stream."] 
      : ["洞察合成离线。", "生物识别链路稳定。", "等待下一流数据。"];
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `As a Chief Research Officer, design a 24-hour digital sleep experiment (protocol) based on this subject's latest metrics.
    Current Data: Score ${data.score}, Deep ${data.deepRatio}%, RHR ${data.heartRate?.resting}bpm.
    
    Output in ${lang === 'zh' ? 'Chinese' : 'English'} as JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hypothesis: { type: Type.STRING },
            protocol: { type: Type.ARRAY, items: { type: Type.STRING } },
            expectedImpact: { type: Type.STRING }
          },
          required: ["hypothesis", "protocol", "expectedImpact"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (err) {
    throw err;
  }
};

export const getWeeklySummary = async (history: SleepRecord[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const recent = history.slice(0, 7);
    const avgScore = Math.round(recent.reduce((acc, r) => acc + r.score, 0) / recent.length);
    
    const prompt = `Summarize this week's sleep lab data in 2 sentences. Focus on the trend of the Sleep Score and heart rate stability.
    Data: Average Score ${avgScore}, Total samples: ${recent.length}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    return response.text || "Trend analysis inconclusive.";
  } catch (err: any) {
    return "Historical synthesis error.";
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string }[], 
  lang: Language = 'en',
  contextData?: SleepRecord | null
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let biometricContext = "";
    if (contextData) {
      biometricContext = lang === 'en' 
        ? `\nCURRENT USER BIOMETRICS: Date: ${contextData.date}, Sleep Score: ${contextData.score}/100, Deep Sleep: ${contextData.deepRatio}%, REM Sleep: ${contextData.remRatio}%, Efficiency: ${contextData.efficiency}%, Resting HR: ${contextData.heartRate.resting}bpm.`
        : `\n当前用户生物识别数据: 日期: ${contextData.date}, 睡眠分数: ${contextData.score}/100, 深睡: ${contextData.deepRatio}%, REM 睡眠: ${contextData.remRatio}%, 效率: ${contextData.efficiency}%, 静息心率: ${contextData.heartRate.resting}bpm。`;
    }

    const systemInstruction = lang === 'en' 
      ? `You are the Somno Chief Research Officer (CRO), a world-class AI Sleep Coach. You are professional, scientific, and data-driven. Your goal is to guide the user through their physiological data and provide actionable health protocols. ${biometricContext} Use Google Search to find the latest peer-reviewed science.`
      : `你是 Somno 首席研究官 (CRO)，世界级的 AI 睡眠教练。你专业、科学并以数据为导向。你的目标是指导用户了解其生理数据并提供可执行的健康方案。 ${biometricContext} 使用 Google 搜索来查找最新的同行评审科学研究。`;

    const chatHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const lastMessage = history[history.length - 1].content;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.75,
      }
    });

    return {
      text: response.text || (lang === 'en' ? "Synthesis failed." : "合成失败。"),
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (err: any) {
    throw err;
  }
};
