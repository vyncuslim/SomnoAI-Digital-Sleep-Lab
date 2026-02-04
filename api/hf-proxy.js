/**
 * SOMNO LAB - HF EXTERNAL NODE PROXY v1.1
 * Vercel Serverless Function to proxy requests to Hugging Face Spaces.
 * Resolves browser CORS "Connection Refused" issues.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { prompt, secret } = req.body;

  // Internal laboratory handshake
  const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  if (secret !== serverSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED_GATEWAY_ACCESS" });
  }

  try {
    // Dispatch to Hugging Face Space (Gradio API Protocol)
    // Note: The previous URL was 404ing. Switching to a more stable verification node or handling failure.
    const hfResponse = await fetch('https://nomic-ai-gpt4all-j.hf.space/run/predict', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        data: [prompt],
        session_hash: Math.random().toString(36).substring(2)
      })
    });

    if (!hfResponse.ok) {
      if (hfResponse.status === 404) {
        return res.status(404).json({ error: "NODE_NOT_FOUND", details: "The Hugging Face space endpoint is currently offline or moved." });
      }
      const errorText = await hfResponse.text();
      throw new Error(`HF_NODE_RESPONSE_ERROR: ${hfResponse.status} - ${errorText}`);
    }

    const result = await hfResponse.json();
    return res.status(200).json(result);

  } catch (error) {
    console.error("[HF Proxy Bridge Failure]:", error);
    return res.status(500).json({ 
      error: "EXTERNAL_NODE_UNREACHABLE", 
      details: error.message 
    });
  }
}