# Google OAuth Login Fix Guide

This guide provides troubleshooting steps for resolving "Failed to fetch" or other errors during Google OAuth login in the Digital Sleep Lab project.

## Common Issues and Solutions

### 1. Missing or Incorrect Environment Variables

**Symptom:** The login button does nothing, or you see a "Configuration Error: Missing Supabase URL" message.

**Solution:**
Ensure that your Vercel project has the correct environment variables set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These values must match your Supabase project settings.

### 2. Invalid Redirect URI

**Symptom:** The Google login popup opens but shows an error like "redirect_uri_mismatch".

**Solution:**
1. Go to your Google Cloud Console (https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Select your OAuth 2.0 Client ID.
4. Under **Authorized redirect URIs**, ensure that your Supabase project URL is listed correctly. It should look like this:
   `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`

### 3. Supabase Provider Configuration

**Symptom:** The Google login popup opens, but authentication fails after selecting an account.

**Solution:**
1. Go to your Supabase project dashboard.
2. Navigate to **Authentication** > **Providers**.
3. Select **Google**.
4. Ensure that the **Client ID** and **Client Secret** match the values from your Google Cloud Console.
5. Make sure the provider is **Enabled**.

### 4. Third-Party Cookies Blocked

**Symptom:** The login popup closes, but nothing happens, or you see a "Failed to fetch" error in the console.

**Solution:**
Some browsers block third-party cookies by default, which can interfere with the OAuth flow.
- Instruct users to allow third-party cookies for your domain.
- Ensure that your Supabase client initialization uses `persistSession: true` and `detectSessionInUrl: true` (this is now configured by default in `supabaseService.ts`).

### 5. Network Issues

**Symptom:** "Failed to fetch" error.

**Solution:**
This can occasionally be caused by ad blockers or network firewalls blocking requests to Supabase or Google domains.
- Try disabling ad blockers or testing on a different network.

## Further Troubleshooting

If you are still experiencing issues, check the browser console and network tab for more detailed error messages. You can also review the Supabase authentication logs in your project dashboard.
