const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

console.log('🔧 Connecting to PostgreSQL database...');
console.log(`📍 Database: ${connectionString.split('@')[1]?.split('/')[0] || 'Supabase'}`);

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executeSQLFile() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'GOOGLE_AUTH_FIX.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Reading GOOGLE_AUTH_FIX.sql...');
    console.log(`📏 File size: ${sqlContent.length} characters\n`);
    
    console.log('🚀 Executing SQL script...\n');
    console.log('═'.repeat(60));
    
    // Execute the entire SQL file as one transaction
    const result = await client.query(sqlContent);
    
    console.log('✅ SQL script executed successfully!');
    console.log('═'.repeat(60));
    
    // Verify trigger was created
    console.log('\n🔍 Verifying trigger installation...\n');
    
    const triggerCheck = await client.query(`
      SELECT 
        trigger_name, 
        event_manipulation, 
        event_object_table,
        action_timing
      FROM information_schema.triggers
      WHERE trigger_name = 'on_auth_user_created'
        AND event_object_schema = 'auth'
        AND event_object_table = 'users';
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('✅ Trigger "on_auth_user_created" is active');
      console.log(`   Event: ${triggerCheck.rows[0].event_manipulation}`);
      console.log(`   Timing: ${triggerCheck.rows[0].action_timing}`);
      console.log(`   Table: auth.${triggerCheck.rows[0].event_object_table}`);
    } else {
      console.log('⚠️  Trigger not found - may need manual installation');
    }
    
    // Verify function exists
    console.log('\n🔍 Verifying functions...\n');
    
    const functionCheck = await client.query(`
      SELECT 
        routine_name, 
        security_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name IN ('handle_new_user', 'update_user_role');
    `);
    
    if (functionCheck.rows.length > 0) {
      functionCheck.rows.forEach(row => {
        console.log(`✅ Function "${row.routine_name}" exists (${row.security_type})`);
      });
    } else {
      console.log('⚠️  Functions not found');
    }
    
    // Check RLS policies
    console.log('\n🔍 Verifying RLS policies...\n');
    
    const policyCheck = await client.query(`
      SELECT 
        policyname,
        cmd
      FROM pg_policies
      WHERE tablename = 'users'
        AND schemaname = 'public'
      ORDER BY cmd, policyname;
    `);
    
    if (policyCheck.rows.length > 0) {
      console.log(`✅ Found ${policyCheck.rows.length} RLS policies on users table:`);
      policyCheck.rows.forEach(row => {
        console.log(`   - ${row.policyname} (${row.cmd})`);
      });
    } else {
      console.log('⚠️  No RLS policies found');
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 GOOGLE AUTH FIX COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n✅ Next steps:');
    console.log('   1. Restart your Next.js dev server');
    console.log('   2. Test Google OAuth signup');
    console.log('   3. Verify user creation in database\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Execute
executeSQLFile().catch(console.error);
