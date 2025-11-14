const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres";

async function executeCleanup() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('\n✅ Connected to database\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', '..', '..', 'CLEANUP_OLD_TABLES.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executing cleanup script...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Execute the SQL
    const result = await client.query(sql);

    // Display notices
    if (result.notices) {
      result.notices.forEach(notice => {
        console.log(notice.message);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Cleanup completed successfully!\n');

    // Verify the results
    console.log('🔍 Verifying database state...\n');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    console.log('📊 Final table list:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    console.log(`\nTotal: ${tablesResult.rows.length} tables\n`);
    
    // Check RLS
    const rlsQuery = `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    const rlsResult = await client.query(rlsQuery);
    const rlsEnabled = rlsResult.rows.filter(r => r.rowsecurity).length;
    
    console.log(`🔒 RLS Status: ${rlsEnabled}/${tablesResult.rows.length} tables have RLS enabled\n`);
    
    if (rlsEnabled === tablesResult.rows.length) {
      console.log('✅ All tables have RLS enabled!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await client.end();
  }
}

executeCleanup();
