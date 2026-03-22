import { supabase } from './supabaseService';

export async function getSleepRecommendation(userData: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch('/api/analyze-sleep', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ prompt: userData })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate recommendation');
    }

    const data = await res.json();
    // 假设返回的 JSON 结构包含 overview, insights, recommendations, tomorrowOptimization
    return `${data.overview}\n\nInsights: ${data.insights?.join(', ')}\n\nRecommendations: ${data.recommendations?.join(', ')}\n\nOptimization: ${data.tomorrowOptimization}`;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
}
