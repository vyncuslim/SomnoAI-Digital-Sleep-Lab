
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";
import { logAuditLog } from "./supabaseService.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

// FIX: Always use API_KEY from process.env as per mandatory security guidelines
const getApiKey = () => {
  return process.env.API_KEY || "";
};

const handleGeminiError = (err: any) => {
  const errMsg = err.message || "";
  console.error("Neural processing exception:", err);
  
  if (errMsg.includes("Requested entity was not found") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("API_KEY")) {
    logAuditLog('API_SERVICE_FAULT', `CRITICAL: Neural Key Voided.\nError: ${errMsg}\nNode: Gemini Core`, 'CRITICAL');
    throw new Error("API_KEY_REQUIRED");
  }
  
  throw new Error("CORE_PROCESSING_EXCEPTION");
};

// Selection of recommended models based on task complexity
const MODEL_FLASH = 'gemini-3-flash-preview'; 
const MODEL_PRO = 'gemini-3-pro-preview'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const prompt = `You are a digital sleep scientist. Perform deep neural analysis. Return JSON array with 3 insights. Data: Score ${data.score}, Deep ${data.deepRatio}%. Language: ${lang}`;
  try {
    const key = getApiKey();
    if (!key) throw new Error("API_KEY_REQUIRED");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        }
      }
    });
    // Properly access text property on GenerateContentResponse
    return JSON.parse(response.text?.trim() || "[]");
  } catch (err) {
    handleGeminiError(err);
    return ["Recalibrating neural nodes."];
  }
};

export const chatWithCoach = async (
  history: { role: string; content: string; image?: string }[], 
  lang: Language = 'en', 
  contextData?: SleepRecord | null
) => {
  const bio = contextData ? `\nTELEMETRY_CONTEXT: Score: ${contextData.score}/100.` : "";
  const systemInstruction = `You are the Somno Chief Research Officer (CRO). ${bio} Answer in ${lang}.`;

  try {
    const key = getApiKey();
    if (!key) throw new Error("API_KEY_REQUIRED");

    const ai = new GoogleGenAI({ apiKey: key });
    const contents = history.map(m => {
      const parts: any[] = [{ text: m.content }];
      if (m.image) {
        parts.push({
          inlineData: { mimeType: 'image/jpeg', data: m.image.split(',')[1] },
        });
      }
      return { role: m.role === 'user' ? 'user' : 'model', parts };
    });

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: contents,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }]
      }
    });
    // Correctly using text property and extracting grounding chunks
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
    const key = getApiKey();
    if (!key) throw new Error("API_KEY_REQUIRED");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Design a sleep experiment based on the current score of ${data.score}. Return in ${lang}.`,
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
    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) { 
    handleGeminiError(err); 
    throw err; 
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  try {
    const key = getApiKey();
    if (!key) throw new Error("API_KEY_REQUIRED");

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Weekly trend report: ${JSON.stringify(history.map(h => ({ d: h.date, s: h.score })))}. Language: ${lang}`,
    });
    return response.text || "Summary failed.";
  } catch (err) { 
    handleGeminiError(err);
    return "Synthesis error occurred."; 
  }
};

export const generateNeuralLullaby = async (data: SleepRecord): Promise<string | undefined> => {
  try {
    const key = getApiKey();
    if (!key) return undefined;

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say cheerfully: Calibration complete for recovery score ${data.score}.` }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
      },
    });
    // Raw PCM data is returned in candidates part inlineData
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) { 
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
