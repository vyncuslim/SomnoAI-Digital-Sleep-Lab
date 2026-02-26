#!/usr/bin/env ts-node

/**
 * Supabase Configuration Verification Script
 * Verifies that all necessary Supabase configuration is in place
 */

import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

interface ConfigStatus {
  isValid: boolean;
  message: string;
  details?: Record<string, any>;
}

async function verifySupabaseConfig(): Promise<ConfigStatus> {
  console.log('🔍 Verifying Supabase Configuration...\n');

  // 1. Check environment variables
  console.log('1️⃣  Checking environment variables...');
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    return {
      isValid: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      details: { missingVars },
    };
  }

  console.log('✅ All environment variables present\n');

  // 2. Verify Supabase connectivity
  console.log('2️⃣  Verifying Supabase connectivity...');
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connectivity
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is a valid error (no rows), others indicate connection issues
      console.error(`❌ Supabase connection error: ${error.message}`);
      return {
        isValid: false,
        message: `Supabase connection failed: ${error.message}`,
        details: { error: error.message },
      };
    }

    console.log('✅ Supabase connectivity verified\n');
  } catch (err: any) {
    console.error(`❌ Error connecting to Supabase: ${err.message}`);
    return {
      isValid: false,
      message: `Failed to connect to Supabase: ${err.message}`,
      details: { error: err.message },
    };
  }

  // 3. Verify URL format
  console.log('3️⃣  Verifying URL format...');
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('❌ Invalid Supabase URL format');
    return {
      isValid: false,
      message: 'Invalid Supabase URL format. Expected: https://xxx.supabase.co',
      details: { url: supabaseUrl },
    };
  }

  console.log('✅ URL format is valid\n');

  // 4. Verify anon key format
  console.log('4️⃣  Verifying anon key format...');
  if (supabaseKey.length < 20) {
    console.error('❌ Anon key appears to be invalid (too short)');
    return {
      isValid: false,
      message: 'Anon key appears invalid (too short)',
      details: { keyLength: supabaseKey.length },
    };
  }

  console.log('✅ Anon key format appears valid\n');

  console.log('✅ All Supabase configuration checks passed!\n');
  return {
    isValid: true,
    message: 'Supabase configuration is valid',
    details: {
      supabaseUrl: supabaseUrl.replace(/\/+$/, ''),
      keyLength: supabaseKey.length,
    },
  };
}

// Run verification
verifySupabaseConfig()
  .then((result) => {
    if (result.isValid) {
      console.log('✅ Configuration Status: VALID');
      console.log(`\nDetails:`, result.details);
      process.exit(0);
    } else {
      console.error('❌ Configuration Status: INVALID');
      console.error(`\nMessage: ${result.message}`);
      if (result.details) {
        console.error(`Details:`, result.details);
      }
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
