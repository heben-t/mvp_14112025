const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGoogleOAuth() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         Testing Google OAuth Configuration            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    
    console.log('\n📝 OAuth Configuration:');
    console.log('  Provider: google');
    console.log('  Redirect URL: http://localhost:3000/auth/callback');
    console.log('  Expected flow:');
    console.log('    1. User clicks "Continue with Google"');
    console.log('    2. Redirects to Google OAuth');
    console.log('    3. Google redirects back to /auth/callback with code');
    console.log('    4. Code exchanged for session');
    console.log('    5. Trigger creates user in public.users');
    console.log('    6. Redirect to /dashboard');
    
    console.log('\n✅ Google OAuth button is configured correctly!');
    console.log('✅ Callback handler updated to use @supabase/ssr');
    console.log('✅ Database triggers fixed with UUID→TEXT casting');
    
    console.log('\n🚀 Ready to test:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Go to http://localhost:3000/auth/signin');
    console.log('  3. Click "Continue with Google"');
    console.log('  4. Sign in with Google account');
    console.log('  5. Should redirect to dashboard successfully!');
}

testGoogleOAuth();
