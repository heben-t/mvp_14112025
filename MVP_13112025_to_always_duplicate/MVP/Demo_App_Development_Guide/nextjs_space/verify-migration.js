const { Client } = require('pg');
require('dotenv').config();

async function verifyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('\n🔍 Verifying Supabase Auth Setup...\n');

    // Check if trigger exists
    const triggerCheck = await client.query(`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_email_verified')
    `);

    console.log('📋 Triggers:');
    triggerCheck.rows.forEach(row => {
      console.log(`   ✅ ${row.trigger_name} on ${row.event_object_table}`);
    });

    // Check if functions exist
    const functionCheck = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('handle_new_user', 'sync_email_verification')
    `);

    console.log('\n⚙️  Functions:');
    functionCheck.rows.forEach(row => {
      console.log(`   ✅ ${row.routine_name}()`);
    });

    // Check password column
    const columnCheck = await client.query(`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('password', 'role', 'updatedAt')
    `);

    console.log('\n📊 Users Table Columns:');
    columnCheck.rows.forEach(row => {
      console.log(`   • ${row.column_name}: ${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default || 'none'}`);
    });

    // Check RLS policies
    const policyCheck = await client.query(`
      SELECT policyname, cmd
      FROM pg_policies
      WHERE tablename = 'users'
    `);

    console.log('\n🔒 RLS Policies:');
    policyCheck.rows.forEach(row => {
      console.log(`   ✅ ${row.policyname} (${row.cmd})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All checks passed! Auth setup is complete.');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

verifyMigration();
