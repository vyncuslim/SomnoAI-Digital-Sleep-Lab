# Supabase Environment Setup Guide

This guide explains how to configure Supabase for the SomnoAI Digital Sleep Lab project.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. A new Supabase project created

## Environment Variables

You need to set the following environment variables in your local `.env` file and in your Vercel project settings:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to find these values:

1. Go to your Supabase project dashboard.
2. Navigate to **Settings** (gear icon) > **API**.
3. Under **Project URL**, copy the URL and use it for `VITE_SUPABASE_URL`.
4. Under **Project API keys**, copy the `anon` `public` key and use it for `VITE_SUPABASE_ANON_KEY`.

## Database Setup

You need to create the necessary tables for the application. You can do this by running the SQL scripts provided in the `supabase/migrations` folder (if available) or by manually creating the tables in the Supabase SQL Editor.

### Required Tables:

1. `profiles`
2. `audit_logs`
3. `feedback`
4. `diary_entries`
5. `security_events`

## Authentication Setup

1. Go to **Authentication** > **Providers** in your Supabase dashboard.
2. Enable **Email** authentication.
3. Enable **Google** authentication (requires setting up Google OAuth credentials).

## Verification

You can verify your Supabase configuration by running the provided script:

```bash
npm run verify-supabase
# or
npx tsx scripts/verify-supabase-config.ts
```

If the script outputs "✅ Supabase configuration is valid and connection successful.", your setup is correct.
