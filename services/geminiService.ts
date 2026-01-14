
import { GoogleGenAI, Type } from "@google/genai";
import { SleepRecord, AIProvider } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const getAIProvider = (): AIProvider => {
  return (localStorage.getItem('somno_ai_provider') as AIProvider) || 'gemini';
};

/**
 * API Key is obtained from process.env.API_KEY which is injected by the platform.
 */
const getGeminiApiKey = () => process.env.API_KEY;

const callOpenAI = async (prompt: string, systemInstruction?: string, isJson: boolean = false) => {
  const apiKey = (window as any).process?.env?.OPENAI_API_KEY || (process.env as any).OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API Key missing");

  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      response_format: isJson ? { type: "json_object" } : { type: "text" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "OpenAI API Failure");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Handles common Gemini API errors, specifically the "Requested entity was not found" error
 * which requires re-selection of the API key.
 */
const handleGeminiError = (err: any) => {
  console.error("Gemini API Error Context:", err);
  if (err.message?.includes("Requested entity was not found")) {
    // Notify app to reset key state if possible, but here we throw a specific message
    throw new Error("KEY_INVALID_OR_NOT_FOUND");
  }
  throw err;
};

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const provider = getAIProvider();
  const prompt = `你是一位世界级的睡眠科学家。请根据以下生理指标进行高精度分析。
    必须返回一个包含 3 条字符串的 JSON 数组，语言为 ${lang === 'zh' ? '中文' : '英文'}。
    1. 生理信号分析（深度/REM 睡眠架构分析）。
    2. 认知/心理状态预测。
    3. 针对今日的战术性生物黑客建议。
    
    指标数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, REM ${data.remRatio}%, 效率 ${data.efficiency}%, 静息心率 ${data.heartRate?.resting}bpm。`;

  try {
    if (provider === 'openai') {
      const result = await callOpenAI(prompt, "You are a specialized Sleep Scientist. Always output valid JSON arrays.", true);
      const parsed = JSON.parse(result || "[]");
      return Array.isArray(parsed) ? parsed : (parsed.insights || parsed.results || Object.values(parsed));
    } else {
      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    }
  } catch (err) {
    handleGeminiError(err);
    return [];
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string }[], 
  lang: Language = 'en',
  contextData?: SleepRecord | null
) => {
  const provider = getAIProvider();
  let biometricContext = "";
  if (contextData) {
    biometricContext = lang === 'en' 
      ? `\nCURRENT USER BIOMETRICS: Sleep Score: ${contextData.score}/100, Deep Sleep: ${contextData.deepRatio}%, Efficiency: ${contextData.efficiency}%.`
      : `\n当前用户生物数据: 睡眠分数: ${contextData.score}/100, 深睡: ${contextData.deepRatio}%, 效率: ${contextData.efficiency}%.`;
  }

  const systemInstruction = lang === 'en' 
    ? `You are the Somno Chief Research Officer (CRO), a world-class AI Sleep Coach. Professional and data-driven. ${biometricContext}`
    : `你是 Somno 首席研究官 (CRO)，世界级的 AI 睡眠教练。专业并以数据为导向。 ${biometricContext}`;

  try {
    if (provider === 'openai') {
      const apiKey = (window as any).process?.env?.OPENAI_API_KEY || (process.env as any).OPENAI_API_KEY;
      const messages = history.map(m => ({ 
        role: m.role === 'assistant' ? 'assistant' : 'user', 
        content: m.content 
      }));
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemInstruction }, ...messages],
          temperature: 0.75
        })
      });
      const data = await response.json();
      return { text: data.choices[0].message.content, sources: [] };
    } else {
      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
      const ai = new GoogleGenAI({ apiKey });
      
      const lastMessage = history[history.length - 1].content;
      const chatHistory = history.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

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
    }
  } catch (err) {
    handleGeminiError(err);
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  const provider = getAIProvider();
  const prompt = `设计一个 24 小时数字睡眠实验。数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, RHR ${data.heartRate?.resting}bpm。语言: ${lang === 'zh' ? '中文' : '英文'}。`;

  try {
    if (provider === 'openai') {
      const result = await callOpenAI(prompt, "You are a Chief Research Officer.", true);
      return JSON.parse(result || "{}");
    } else {
      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
      const ai = new GoogleGenAI({ apiKey });
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
    }
  } catch (err) {
    handleGeminiError(err);
    throw err;
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  const dataSummary = history.slice(0, 7).map(h => ({ date: h.date, score: h.score }));
  const prompt = `作为睡眠科学家分析这些趋势并提供 2 句话总结。语言: ${lang === 'zh' ? '中文' : '英文'}。数据: ${JSON.stringify(dataSummary)}`;

  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "Analysis failed.";
  } catch (err) {
    handleGeminiError(err);
    return "Error generating summary.";
  }
};
