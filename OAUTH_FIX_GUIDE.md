# SomnoAI Google OAuth "Failed to fetch" Fix Guide

## Issue Summary
The application is showing "Failed to fetch" error when attempting to use Google OAuth login. This is typically caused by one of the following:

1. **Missing Supabase Configuration** - Environment variables not set
2. **Invalid OAuth Redirect URI** - Google OAuth provider not configured correctly
3. **CORS Issues** - Cross-origin requests being blocked
4. **Network Connectivity** - Supabase endpoint unreachable

## Root Cause Analysis

### The "Failed to fetch" Error
This error occurs when:
- The browser cannot reach the Supabase authentication endpoint
- Supabase project URL or anon key is missing/invalid
- Google OAuth provider is not properly configured in Supabase
- CORS headers are misconfigured

## Solution Steps

### Step 1: Verify Supabase Environment Variables

**Required environment variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**For Vercel deployment:**
1. Go to your Vercel project settings
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**For local development:**
Create `.env.local` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 2: Configure Google OAuth in Supabase

1. **In Supabase Dashboard:**
   - Go to **Authentication > Providers**
   - Click on **Google**
   - Enable the provider
   - Add your Google OAuth credentials:
     - Client ID
     - Client Secret

2. **In Google Cloud Console:**
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback?provider=google`
     - `http://localhost:3000/auth/v1/callback?provider=google` (for local dev)
     - Your production domain callback URLs

### Step 3: Verify CORS Configuration

The Supabase client should automatically handle CORS. Ensure:
- Your frontend domain is allowed in Supabase project settings
- No custom proxy is interfering with requests

### Step 4: Check Network Connectivity

**In browser DevTools:**
1. Open **Network** tab
2. Attempt Google login
3. Look for failed requests to `supabase.co`
4. Check the response status and error message

**Common network errors:**
- `ERR_NAME_NOT_RESOLVED` - DNS issue
- `ERR_CONNECTION_REFUSED` - Firewall/network blocking
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - CORS issue

### Step 5: Enhanced Error Logging

The application now includes enhanced error logging. Check browser console for detailed error messages:

```javascript
// Look for messages like:
// "Google Login Error: {error details}"
// "OTP Verification Error: {error details}"
```

## Troubleshooting Checklist

- [ ] Supabase URL is correct and accessible
- [ ] Supabase anon key is valid and not expired
- [ ] Google OAuth provider is enabled in Supabase
- [ ] Google OAuth credentials are correctly configured
- [ ] Redirect URIs match exactly (including protocol and path)
- [ ] Environment variables are set in Vercel
- [ ] No CORS errors in browser console
- [ ] Network requests to Supabase are successful (200 status)
- [ ] Supabase project is not paused or deleted

## Verification Steps

### Test OAuth Configuration

1. **Local Testing:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/auth
   # Try Google login
   # Check browser console for errors
   ```

2. **Production Testing:**
   - Deploy to Vercel
   - Test Google login on production domain
   - Check Vercel function logs for errors

### Check Supabase Logs

1. In Supabase Dashboard:
   - Go to **Logs** section
   - Filter by `auth` service
   - Look for OAuth-related errors

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-auth/auth-google)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## Emergency Fallback

If Google OAuth continues to fail:
1. Use **OTP Mode** (One-Time Password) for login
2. Use **Password Mode** for signup/login
3. Contact Supabase support if backend is down

## Next Steps

1. Set environment variables in Vercel
2. Verify Google OAuth provider configuration
3. Test on production domain
4. Monitor browser console for detailed errors
5. Check Supabase logs for backend issues
