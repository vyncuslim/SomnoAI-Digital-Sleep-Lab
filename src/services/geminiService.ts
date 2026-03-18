import { supabase } from './supabaseService';

export async function getSleepRecommendation(userData: string): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const res = await fetch('/api/sleep-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userData })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate recommendation');
    }

    const data = await res.json();
    return data.text || "No recommendation available.";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw error;
  }
}
