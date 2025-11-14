const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres";

async function checkDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('\n✅ Connected to database\n');

    // Check all tables in public schema
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const result = await client.query(tablesQuery);
    
    console.log('📊 CURRENT TABLES IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const expectedNewTables = [
      'users',
      'accounts',
      'sessions',
      'verification_tokens',
      'startup_profiles',
      'investor_profiles',
      'campaigns',
      'investments',
      'watchlists',
      'startup_metrics',
      'campaign_comments',
      'campaign_followers',
      'subscriptions',
      'investor_preferences'
    ];
    
    const actualTables = result.rows.map(row => row.table_name);
    
    console.log(`Total tables found: ${actualTables.length}\n`);
    
    actualTables.forEach((table, index) => {
      const isExpected = expectedNewTables.includes(table);
      const symbol = isExpected ? '✅' : '❌';
      const label = isExpected ? '(NEW SCHEMA)' : '(OLD SCHEMA)';
      console.log(`${index + 1}. ${symbol} ${table} ${label}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Check if new schema tables exist
    const newTablesFound = expectedNewTables.filter(t => actualTables.includes(t));
    const oldTablesFound = actualTables.filter(t => !expectedNewTables.includes(t));
    
    console.log('📋 SUMMARY:');
    console.log(`  New schema tables found: ${newTablesFound.length}/${expectedNewTables.length}`);
    console.log(`  Old schema tables found: ${oldTablesFound.length}`);
    console.log('');
    
    if (newTablesFound.length === expectedNewTables.length && oldTablesFound.length === 0) {
      console.log('✅ DATABASE REBUILD COMPLETE!');
      console.log('   All new tables present, no old tables remaining.\n');
    } else if (newTablesFound.length > 0) {
      console.log('⚠️  PARTIAL MIGRATION');
      console.log('   Some new tables exist but old tables remain.\n');
    } else {
      console.log('❌ DATABASE NOT REBUILT');
      console.log('   Please execute COMPLETE_DATABASE_REBUILD.sql in Supabase SQL Editor.\n');
    }
    
    // Check if campaign_comments table exists (new feature)
    if (actualTables.includes('campaign_comments')) {
      console.log('✅ Social features enabled (campaign_comments table found)');
    }
    
    // Check RLS status
    console.log('\n🔒 CHECKING RLS STATUS:\n');
    const rlsQuery = `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    const rlsResult = await client.query(rlsQuery);
    const rlsEnabled = rlsResult.rows.filter(r => r.rowsecurity).length;
    const rlsDisabled = rlsResult.rows.filter(r => !r.rowsecurity).length;
    
    console.log(`  RLS enabled on: ${rlsEnabled} tables`);
    console.log(`  RLS disabled on: ${rlsDisabled} tables`);
    
    if (rlsEnabled === actualTables.length) {
      console.log('  ✅ All tables have RLS enabled\n');
    } else {
      console.log('  ⚠️  Not all tables have RLS enabled\n');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
