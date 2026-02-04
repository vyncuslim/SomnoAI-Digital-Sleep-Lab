/**
 * SOMNO LAB EXTERNAL NODE SERVICE v1.1
 * Handles communication with Hugging Face Spaces via internal secure proxy.
 */

export const hfService = {
  /**
   * Dispatches a prediction request to the internal HF proxy.
   */
  chat: async (prompt: string): Promise<string> => {
    try {
      const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
      
      const response = await fetch('/api/hf-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
          secret: INTERNAL_LAB_KEY
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "GATEWAY_HANDSHAKE_VOID");
      }

      const result = await response.json();
      
      // Extract data from standard Gradio array response
      if (result && result.data && result.data[0]) {
        return result.data[0];
      }

      throw new Error("NODE_SIGNAL_EMPTY");
    } catch (error) {
      console.error("[External Node Protocol Breach]:", error);
      throw error;
    }
  }
};