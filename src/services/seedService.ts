import { supabase } from './supabaseService';

export const seedService = {
  seedAll: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      // 1. Seed Articles
      await supabase.from('articles').upsert([
        { 
          title: 'Welcome to the Platform', 
          slug: 'welcome', 
          content: 'This is your first article.', 
          is_published: true,
          published_at: now.toISOString()
        },
        { 
          title: 'How to use the Dashboard', 
          slug: 'dashboard-guide', 
          content: 'A guide to using the admin dashboard.', 
          is_published: true,
          published_at: now.toISOString()
        }
      ]);

      // 2. Seed Analytics (Country)
      await supabase.from('analytics_country').upsert([
        { country_code: 'US', country_name: 'United States', visitor_count: 150 },
        { country_code: 'CN', country_name: 'China', visitor_count: 200 },
        { country_code: 'GB', country_name: 'United Kingdom', visitor_count: 80 }
      ]);

      // 3. Seed Analytics (Device)
      await supabase.from('analytics_device').upsert([
        { device_type: 'desktop', browser: 'Chrome', os: 'Windows', visitor_count: 300 },
        { device_type: 'mobile', browser: 'Safari', os: 'iOS', visitor_count: 150 },
        { device_type: 'tablet', browser: 'Chrome', os: 'Android', visitor_count: 50 }
      ]);

      // 4. Seed Daily Summaries
      await supabase.from('daily_sleep_summary').upsert([
        { user_id: user.id, date: yesterday.toISOString().split('T')[0], avg_score: 85, total_duration_min: 480 },
        { user_id: user.id, date: now.toISOString().split('T')[0], avg_score: 78, total_duration_min: 420 }
      ]);

      await supabase.from('daily_steps_summary').upsert([
        { user_id: user.id, date: yesterday.toISOString().split('T')[0], steps_count: 8500, distance_meters: 6000, calories_burned: 450 },
        { user_id: user.id, date: now.toISOString().split('T')[0], steps_count: 10200, distance_meters: 7500, calories_burned: 550 }
      ]);

      // 5. Seed Diary Entries
      await supabase.from('diary_entries').upsert([
        { user_id: user.id, date: now.toISOString().split('T')[0], content: 'Today was a productive day!', mood: 'Happy', tags: ['work', 'fitness'] }
      ]);

      // 6. Seed Subscriptions
      await supabase.from('subscriptions').upsert([
        { 
          user_id: user.id, 
          plan_id: 'premium_monthly', 
          status: 'active', 
          current_period_start: now.toISOString(),
          current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      // 7. Seed Health Records
      await supabase.from('health_records').upsert([
        { user_id: user.id, record_type: 'heart_rate', value: 72, unit: 'bpm', recorded_at: now.toISOString() },
        { user_id: user.id, record_type: 'blood_pressure', value: 120, unit: 'mmHg', recorded_at: now.toISOString() }
      ]);

      // 8. Seed User App Status
      await supabase.from('user_app_status').upsert([
        { user_id: user.id, is_online: true, current_version: '1.0.0', onboarding_completed: true }
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error seeding data:', error);
      return { success: false, error };
    }
  }
};
