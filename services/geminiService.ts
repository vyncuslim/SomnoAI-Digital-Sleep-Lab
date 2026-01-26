import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const getActiveApiKey = () => {
  return process.env.API_KEY || '';
};

const handleGeminiError = (err: any) => {
  console.error("Gemini API Error Context:", err);
  throw new Error("CORE_PROCESSING_EXCEPTION");
};

const MODEL_FLASH = 'gemini-3-flash-preview'; 
const MODEL_PRO = 'gemini-3-pro-preview'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const apiKey = getActiveApiKey();
  const prompt = `You are a world-class digital sleep scientist and chief biohacker. Please perform deep neural analysis based on the following high-precision physiological telemetry.
    You MUST return a JSON array containing 3 professional strings. 
    1. Neural Architecture Analysis: Analyze brain clearing efficiency and memory consolidation based on Deep and REM ratios.
    2. Circadian Diagnosis: Assess the correlation between Resting Heart Rate (RHR) and Sleep Score to predict today's cognitive load.
    3. Tactical Biohacking Suggestion: Provide one physiological optimization protocol that can be executed today.
    Data: Score ${data.score}, Deep ${data.deepRatio}%, REM ${data.remRatio}%, RHR ${data.heartRate?.resting}bpm.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
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
    console.warn("Insight failed:", err);
    return ["Analysis stream paused.", "Recalibrating neural nodes.", "Link maintained."];
  }
};

export const chatWithCoach = async (history: { role: string; content: string }[], lang: Language = 'en', contextData?: SleepRecord | null) => {
  const apiKey = getActiveApiKey();
  const bio = contextData ? `\nTELEMETRY: Score: ${contextData.score}/100, Deep: ${contextData.deepRatio}%, Efficiency: ${contextData.efficiency}%.` : "";
  const systemInstruction = `You are the Somno Chief Research Officer. Professional, futuristic, data-driven. Bio: ${bio}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });
    return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) { 
    handleGeminiError(err); 
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  const apiKey = getActiveApiKey();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Design a sleep experiment based on: score ${data.score}, RHR ${data.heartRate?.resting}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { hypothesis: { type: Type.STRING }, protocol: { type: Type.ARRAY, items: { type: Type.STRING } }, expectedImpact: { type: Type.STRING } },
          required: ["hypothesis", "protocol", "expectedImpact"]
        },
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) { 
    handleGeminiError(err); 
    throw err; 
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  const apiKey = getActiveApiKey();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Summarize trends for: ${JSON.stringify(history.map(h => ({ d: h.date, s: h.score })))}, use English only.`,
    });
    return response.text || "Summary failed.";
  } catch (err) { 
    return "Synthesis error occurred."; 
  }
};

export const generateNeuralLullaby = async (data: SleepRecord, lang: Language = 'en'): Promise<string | undefined> => {
  const apiKey = getActiveApiKey();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say cheerfully: Sleep guided meditation based on score ${data.score}.` }] }],
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