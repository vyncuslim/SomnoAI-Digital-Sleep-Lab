
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const handleGeminiError = (err: any) => {
  const errMsg = err.message || "";
  console.error("Gemini API Error Context:", err);
  
  // Specific catch for AI Studio key selector
  if (errMsg.includes("Requested entity was not found") || errMsg.includes("API_KEY_INVALID")) {
    console.warn("[Neural Bridge] Identity reset required. Re-triggering key selector.");
    (window as any).aistudio?.openSelectKey().catch(() => {});
    throw new Error("API_KEY_REQUIRED");
  }
  
  if (errMsg.includes("API_KEY")) throw new Error("API_KEY_REQUIRED");
  throw new Error("CORE_PROCESSING_EXCEPTION");
};

// Model Constants
const MODEL_FLASH = 'gemini-3-flash-preview'; 
const MODEL_PRO = 'gemini-3-pro-preview'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const prompt = `You are a digital sleep scientist. Perform deep neural analysis based on physiological telemetry.
    Return a JSON array containing 3 professional strings:
    1. Neural Architecture Analysis (Deep/REM ratio)
    2. Circadian Diagnosis
    3. Tactical Biohacking Suggestion
    Data: Score ${data.score}, Deep ${data.deepRatio}%, REM ${data.remRatio}%, RHR ${data.heartRate?.resting}bpm.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
        thinkingConfig: { thinkingBudget: 12000 }
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    handleGeminiError(err);
    return ["Analysis stream paused.", "Recalibrating neural nodes.", "Link maintained."];
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string; image?: string }[], 
  lang: Language = 'en', 
  contextData?: SleepRecord | null
) => {
  const bio = contextData ? `\nTELEMETRY_CONTEXT: Score: ${contextData.score}/100, Deep: ${contextData.deepRatio}%, RHR: ${contextData.heartRate.resting}bpm.` : "";
  const systemInstruction = `You are the Somno Chief Research Officer (CRO). Data-driven and professional. Bio: ${bio}
    Analyze facial scans for fatigue indicators and correlate with sleep telemetry.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = history.map(m => {
      const parts: any[] = [{ text: m.content }];
      if (m.image) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: m.image.split(',')[1],
          },
        });
      }
      return { role: m.role === 'user' ? 'user' : 'model', parts };
    });

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: contents,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });
    return { 
      text: response.text, 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (err) { 
    handleGeminiError(err); 
  }
};

export const designExperiment = async (data: SleepRecord, lang: Language = 'en'): Promise<SleepExperiment> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Design a sleep experiment based on telemetry: score ${data.score}, RHR ${data.heartRate?.resting}.`,
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
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Synthesize a weekly biometric trend report: ${JSON.stringify(history.map(h => ({ d: h.date, s: h.score })))}, English only.`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "Summary failed.";
  } catch (err) { 
    handleGeminiError(err);
    return "Synthesis error occurred."; 
  }
};

export const generateNeuralLullaby = async (data: SleepRecord, lang: Language = 'en'): Promise<string | undefined> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say cheerfully: Guided meditation for recovery score ${data.score}. Relax your neural pathways.` }] }],
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
