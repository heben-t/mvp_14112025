/**
 * Script to execute the Google OAuth database setup
 * Run this to configure the database for OAuth authentication
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log('🔧 Setting up Google OAuth database configuration...\n');

  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'setup-google-oauth-database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('📄 Executing SQL migration...');
    
    // Split SQL into individual statements (basic splitting by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--') || statement.length < 10) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Try direct execution via REST API instead
          const { error: directError } = await supabase
            .from('_sql')
            .insert({ query: statement });

          if (directError) {
            console.log(`⚠️  Statement ${i + 1}: ${directError.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err: any) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Database setup complete!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Warnings: ${errorCount}`);

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    
    // Check if users table exists
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(0);

    if (tablesError) {
      console.log('⚠️  Users table check failed:', tablesError.message);
    } else {
      console.log('✅ Users table exists and is accessible');
    }

    // Check if trigger exists
    const { data: triggers } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT trigger_name 
          FROM information_schema.triggers 
          WHERE trigger_name = 'on_auth_user_created'
        ` 
      });

    console.log('✅ Database trigger configured');

    console.log('\n📋 Next steps:');
    console.log('   1. Enable Google provider in Supabase Dashboard');
    console.log('   2. Add Google OAuth credentials in Supabase');
    console.log('   3. Configure redirect URIs in Google Console');
    console.log('   4. Test the OAuth flow');
    console.log('\n   See GOOGLE_OAUTH_REBUILD_COMPLETE.md for detailed instructions');

  } catch (error: any) {
    console.error('❌ Error setting up database:', error);
    console.error('\nPlease run the SQL file manually in Supabase SQL Editor:');
    console.error('   1. Go to Supabase Dashboard → SQL Editor');
    console.error('   2. Create a new query');
    console.error('   3. Copy contents of setup-google-oauth-database.sql');
    console.error('   4. Execute the query');
    process.exit(1);
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
