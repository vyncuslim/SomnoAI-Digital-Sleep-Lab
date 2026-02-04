/**
 * SOMNO LAB - VERTEX AI SECURE BRIDGE v1.1
 * Vercel Serverless Function to proxy requests to Google Cloud Vertex AI.
 * Prevents credential leakage to the frontend.
 */

import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { inputData, secret, modelId } = req.body;
    
    // Internal handshaking to prevent public scraping of the lab's bridge
    const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
    if (secret !== INTERNAL_LAB_KEY) {
      return res.status(401).json({ error: "UNAUTHORIZED_HANDSHAKE" });
    }

    // 1. Initialize Google Auth with the specified Project ID
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "gen-lang-client-0694195176";
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      projectId: GCP_PROJECT_ID,
      credentials: process.env.VERTEX_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_KEY) : undefined
    });

    const client = await auth.getClient();
    
    // 2. Configure Endpoint Path
    const location = "us-central1";
    
    // If a specific custom model ID is provided, use the deployment path. 
    // Otherwise, default to the standard Gemini 1.5 Pro publisher path.
    let url;
    if (modelId) {
      url = `https://${location}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${location}/models/${modelId}:predict`;
    } else {
      url = `https://${location}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${location}/publishers/google/models/gemini-1.5-pro-002:predict`;
    }

    // 3. Dispatch Prediction Request
    const vertexRes = await client.request({
      url,
      method: "POST",
      data: {
        instances: [
          // Handle standard string prompts or structured instances
          typeof inputData === 'string' ? { content: inputData } : inputData
        ],
        parameters: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40
        }
      }
    });

    // 4. Return result to Lab Console
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
    console.error("[Vertex Bridge Fault]:", err);
    res.status(500).json({ 
      error: "AI_ANALYSIS_FAILED", 
      details: err.message,
      code: err.code || 500
    });
  }
}