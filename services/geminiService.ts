import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SleepRecord } from "../types.ts";
import { Language } from "./i18n.ts";
import { logAuditLog, supabase } from "./supabaseService.ts";

export interface SleepExperiment {
  hypothesis: string;
  protocol: string[];
  expectedImpact: string;
}

const N8N_WEBHOOK_URL = "https://somnoaidigitalsleeplab.app.n8n.cloud/webhook/debda1be-d725-4f68-b02a-1b1dac5ee136";

/**
 * Pipes AI activity to the n8n neural automation bridge.
 */
const notifyN8NBridge = async (event: string, type: string) => {
  try {
    const { data: { user } } = await (supabase.auth as any).getUser();
    const url = new URL(N8N_WEBHOOK_URL);
    url.searchParams.append('event', event);
    url.searchParams.append('node', 'ai_service');
    url.searchParams.append('type', type);
    url.searchParams.append('subject', user?.email || 'anonymous');
    
    // Using no-cors as it's a fire-and-forget signal to a GET webhook
    await fetch(url.toString(), { method: 'GET', mode: 'no-cors' });
  } catch (e) {
    // Silent fail to maintain AI service availability
  }
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

/**
 * Priority Hierarchy:
 * 1. User-provided key in localStorage ('somno_custom_key')
 * 2. System environment key (process.env.API_KEY)
 */
const getAIClient = () => {
  const customKey = localStorage.getItem('somno_custom_key');
  const apiKey = customKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_VOID");
  return new GoogleGenAI({ apiKey });
};

const MODEL_FLASH = 'gemini-2.5-flash'; 
const MODEL_PRO = 'gemini-2.5-pro'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const getSleepInsight = async (data: SleepRecord, lang: Language = 'en'): Promise<string[]> => {
  const prompt = `You are a digital sleep scientist. Perform deep neural analysis. Return JSON array with 3 insights. Data: Score ${data.score}, Deep ${data.deepRatio}%. Language: ${lang}`;
  try {
    const ai = getAIClient();
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
    
    const result = JSON.parse(response.text?.trim() || "[]");
    notifyN8NBridge('insight_generated', 'flash_model');
    return result;
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
    const ai = getAIClient();
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
    
    notifyN8NBridge('chat_message', 'pro_model');
    
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
    const ai = getAIClient();
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
    
    notifyN8NBridge('experiment_designed', 'pro_model');
    return JSON.parse(response.text?.trim() || "{}");
  } catch (err) { 
    handleGeminiError(err); 
    throw err; 
  }
};

export const getWeeklySummary = async (history: SleepRecord[], lang: Language = 'en'): Promise<string> => {
  try {
    const ai = getAIClient();
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
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: `Say cheerfully: Calibration complete for recovery score ${data.score}.` }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
      },
    });
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