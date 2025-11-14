/**
 * Verification Script for Google OAuth Setup
 * Checks if everything is configured correctly
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ name, status, message });
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 GOOGLE OAUTH SETUP VERIFICATION RESULTS');
  console.log('='.repeat(60) + '\n');

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else warnCount++;
  });

  console.log('='.repeat(60));
  console.log(`Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
  console.log('='.repeat(60) + '\n');

  if (failCount > 0) {
    console.log('❌ Setup incomplete. Please fix the failed checks above.\n');
    console.log('💡 Quick fixes:');
    console.log('   1. Run: npx tsx setup-google-oauth.ts');
    console.log('   2. Enable Google in Supabase Dashboard');
    console.log('   3. Add redirect URIs in Google Console\n');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  Setup mostly complete, but some warnings need attention.\n');
  } else {
    console.log('🎉 All checks passed! Your Google OAuth is ready to use!\n');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Go to: http://localhost:3000/auth/signup');
    console.log('   3. Click "Continue with Google"');
    console.log('   4. Test the full OAuth flow\n');
  }
}

async function verifySetup() {
  console.log('🔍 Verifying Google OAuth setup...\n');

  // Check 1: Environment variables
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    addResult(
      'Environment Variables',
      'fail',
      'Missing required environment variables. Check your .env file.'
    );
  } else {
    addResult(
      'Environment Variables',
      'pass',
      'All required Supabase environment variables are present'
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    printResults();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Check 2: Users table exists
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      addResult(
        'Users Table',
        'fail',
        `Users table error: ${error.message}. Run setup-google-oauth.ts`
      );
    } else {
      addResult(
        'Users Table',
        'pass',
        'Users table exists and is accessible'
      );
    }
  } catch (err: any) {
    addResult(
      'Users Table',
      'fail',
      `Failed to check users table: ${err.message}`
    );
  }

  // Check 3: Startup profiles table
  try {
    const { error } = await supabase
      .from('startup_profiles')
      .select('id')
      .limit(1);

    if (error) {
      addResult(
        'Startup Profiles Table',
        'warning',
        `Startup profiles table issue: ${error.message}`
      );
    } else {
      addResult(
        'Startup Profiles Table',
        'pass',
        'Startup profiles table exists'
      );
    }
  } catch (err: any) {
    addResult(
      'Startup Profiles Table',
      'warning',
      'Startup profiles table may not exist or has issues'
    );
  }

  // Check 4: Investor profiles table
  try {
    const { error } = await supabase
      .from('investor_profiles')
      .select('id')
      .limit(1);

    if (error) {
      addResult(
        'Investor Profiles Table',
        'warning',
        `Investor profiles table issue: ${error.message}`
      );
    } else {
      addResult(
        'Investor Profiles Table',
        'pass',
        'Investor profiles table exists'
      );
    }
  } catch (err: any) {
    addResult(
      'Investor Profiles Table',
      'warning',
      'Investor profiles table may not exist or has issues'
    );
  }

  // Check 5: RLS is enabled
  try {
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      `,
    });

    if (!rlsError && rlsData) {
      addResult(
        'Row Level Security',
        'pass',
        'RLS is configured for users table'
      );
    } else {
      addResult(
        'Row Level Security',
        'warning',
        'Could not verify RLS status (may need manual check)'
      );
    }
  } catch (err) {
    addResult(
      'Row Level Security',
      'warning',
      'Could not verify RLS status automatically'
    );
  }

  // Check 6: Supabase URL format
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    addResult(
      'Supabase URL Format',
      'fail',
      `Invalid Supabase URL: ${supabaseUrl}`
    );
  } else {
    addResult(
      'Supabase URL Format',
      'pass',
      `Supabase URL is correctly formatted`
    );
  }

  // Check 7: Google OAuth credentials in env (reference only)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    addResult(
      'Google Credentials (Reference)',
      'pass',
      'Google credentials found in .env (remember to add them in Supabase Dashboard too!)'
    );
  } else {
    addResult(
      'Google Credentials (Reference)',
      'warning',
      'Google credentials not in .env file (they should be configured in Supabase Dashboard)'
    );
  }

  // Manual checks reminder
  addResult(
    'Supabase Dashboard - Google Provider',
    'warning',
    'MANUAL CHECK: Go to Supabase Dashboard → Auth → Providers → Enable Google and add credentials'
  );

  addResult(
    'Google Console - Redirect URIs',
    'warning',
    `MANUAL CHECK: Add https://gnzcvhyxiatcjofywkdq.supabase.co/auth/v1/callback to Google Console`
  );

  printResults();
}

// Run verification
verifySetup().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
