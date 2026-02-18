/**
 * SOMNO LAB - VERTEX AI SECURE BRIDGE v1.3
 * Enhanced diagnostics and environment validation.
 */

import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { inputData, secret, modelId } = req.body;
    
    const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
    if (secret !== INTERNAL_LAB_KEY) {
      return res.status(401).json({ error: "UNAUTHORIZED_HANDSHAKE" });
    }

    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "gen-lang-client-0694195176";
    const SA_KEY_RAW = process.env.VERTEX_SERVICE_ACCOUNT_KEY;

    if (!SA_KEY_RAW) {
      console.error("[Vertex Bridge]: Environment variable VERTEX_SERVICE_ACCOUNT_KEY is missing.");
      return res.status(500).json({ error: "VERTEX_CONFIG_INCOMPLETE", details: "Bridge node credentials missing." });
    }

    let credentials;
    try {
      credentials = JSON.parse(SA_KEY_RAW);
    } catch (e) {
      console.error("[Vertex Bridge]: Credential parsing failed.", e.message);
      return res.status(500).json({ error: "VERTEX_CONFIG_CORRUPT", details: "Bridge node credentials malformed." });
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      projectId: GCP_PROJECT_ID,
      credentials
    });

    const client = await auth.getClient();
    const location = process.env.GCP_LOCATION || "us-central1";
    
    /**
     * FIXED: Production path requirement: avoid preview models.
     * Defaulting to Gemini 2.5 Pro for biological telemetry synthesis.
     */
    const targetModel = modelId || process.env.VERTEX_MODEL_ID || "gemini-2.5-pro";
    
    // Determine URL based on model type
    const url = targetModel.includes('/') 
      ? `https://${location}-aiplatform.googleapis.com/v1/${targetModel}:predict`
      : `https://${location}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${location}/publishers/google/models/${targetModel}:predict`;

    const vertexRes = await client.request({
      url,
      method: "POST",
      data: {
        instances: [
          typeof inputData === 'string' ? { content: inputData } : inputData
        ],
        parameters: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          topP: 0.9,
          topK: 40
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      result: vertexRes.data,
      metadata: {
        node: `vertex-${location}-secure`,
        project: GCP_PROJECT_ID,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    const errorMsg = err.response?.data?.error?.message || err.message;
    console.error("[Vertex Bridge Fault]:", errorMsg);
    res.status(500).json({ 
      error: "AI_ANALYSIS_FAILED", 
      details: errorMsg,
      code: err.code || 500
    });
  }
}