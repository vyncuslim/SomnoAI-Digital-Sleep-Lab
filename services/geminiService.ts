
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const handleGeminiError = (err: any) => {
  console.error("Gemini API Error Context:", err);
  if (err.message?.includes("fetch")) {
    throw new Error("NETWORK_FAILURE: Check your connectivity to Google AI services.");
  }
  if (err.message?.includes("Requested entity was not found")) {
    throw new Error("KEY_INVALID_OR_NOT_FOUND");
  }
  throw err;
};

// Model selection based on task type
const MODEL_FLASH = 'gemini-3-flash-preview'; 
const MODEL_PRO = 'gemini-3-pro-preview'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  if (!process.env.API_KEY) throw new Error("GEMINI_API_KEY_MISSING");
  
  const prompt = `你是一位世界级的数字睡眠科学家与首席生物黑客。请根据以下高精度生理遥测指标进行深度神经分析。
    必须返回一个包含 3 条专业字符串的 JSON 数组，语言为 ${lang === 'zh' ? '中文' : '英文'}。
    1. 神经架构分析：基于深度与 REM 比例分析大脑清理效率与记忆巩固状态。
    2. 生物节律诊断：评估静息心率 (RHR) 与睡眠分数的关联，预测今日认知负荷。
    3. 战术性生物黑客建议：针对性提供一项今日可立即执行的生理优化方案。
    
    数据: 评分 ${data.score}, 深度 ${data.deepRatio}%, REM ${data.remRatio}%, RHR ${data.heartRate?.resting}bpm。`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    handleGeminiError(err);
    return [];
  }
};

export const chatWithCoach = async (history: { role: string; content: string }[], lang: Language = 'en', contextData?: SleepRecord | null) => {
  if (!process.env.API_KEY) throw new Error("GEMINI_API_KEY_MISSING");
  
  const bio = contextData ? `\nTELEMETRY: Score: ${contextData.score}/100, Deep: ${contextData.deepRatio}%, Efficiency: ${contextData.efficiency}%.` : "";
  const systemInstruction = `You are the Somno Chief Research Officer. Professional, futuristic, data-driven. ${bio}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }], 
        thinkingConfig: { thinkingBudget: 16000 } 
      }
    });
    return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) { 
    handleGeminiError(err); 
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  if (!process.env.API_KEY) throw new Error("GEMINI_API_KEY_MISSING");
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Design a sleep experiment based on: score ${data.score}, RHR ${data.heartRate?.resting}. Language: ${lang}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { hypothesis: { type: Type.STRING }, protocol: { type: Type.ARRAY, items: { type: Type.STRING } }, expectedImpact: { type: Type.STRING } },
          required: ["hypothesis", "protocol", "expectedImpact"]
        },
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) { 
    handleGeminiError(err); 
    throw err; 
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  if (!process.env.API_KEY) return "API Key Missing.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Summarize trends for: ${JSON.stringify(history.map(h => ({ d: h.date, s: h.score })))}, lang: ${lang}.`,
    });
    return response.text || "Summary failed.";
  } catch (err) { 
    return "Synthesis error: " + (err instanceof Error ? err.message : 'Unknown'); 
  }
};

export const generateNeuralLullaby = async (data: SleepRecord, lang: Language = 'en'): Promise<string | undefined> => {
  if (!process.env.API_KEY) return undefined;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say cheerfully: Sleep guided meditation based on score ${data.score}. Lang: ${lang}` }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) { 
    console.warn("Lullaby generation failed:", err);
    return undefined; 
  }
};

export const decodeBase64Audio = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

export const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
};
