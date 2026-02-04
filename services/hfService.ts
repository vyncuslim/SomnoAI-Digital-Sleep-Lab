/**
 * SOMNO LAB EXTERNAL NODE SERVICE v1.0
 * Handles communication with Hugging Face Spaces via Fetch API.
 * Target: nomic-ai/gpt4all-j
 */

export const hfService = {
  /**
   * Dispatches a prediction request to the HF external node.
   * Uses the Gradio /run/predict protocol.
   */
  chat: async (prompt: string): Promise<string> => {
    try {
      // NOTE: Using the primary Gradio API endpoint for nomic-ai/gpt4all-j
      // This is the "Advanced Method" described in laboratory documentation.
      const response = await fetch('https://nomic-ai-gpt4all-j.hf.space/run/predict', {
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

      if (!response.ok) throw new Error("NODE_HANDSHAKE_FAILED");

      const result = await response.json();
      
      // Gradio usually returns an object with a 'data' array.
      // The response is typically at index 0.
      if (result && result.data && result.data[0]) {
        return result.data[0];
      }

      throw new Error("NODE_RESPONSE_EMPTY");
    } catch (error) {
      console.error("[External Node Connection Severed]:", error);
      throw error;
    }
  }
};