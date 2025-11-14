const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function disableRLS() {
  try {
    await client.connect();
    console.log('🔓 Disabling RLS for testing...\n');
    
    const sqlFile = fs.readFileSync(path.join(__dirname, 'DISABLE_RLS.sql'), 'utf8');
    
    await client.query(sqlFile);
    
    console.log('✅ RLS DISABLED\n');
    
    // Verify
    const result = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename IN ('users', 'investor_profiles', 'startup_profiles', 'accounts', 'sessions')
        AND schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log('📊 Table RLS Status:');
    result.rows.forEach(row => {
      const status = row.rowsecurity ? '🔒 ENABLED' : '🔓 DISABLED';
      console.log(`   ${status} - ${row.tablename}`);
    });
    
    console.log('\n⚠️  WARNING: All security policies removed!');
    console.log('   This is for TESTING ONLY - re-enable RLS for production\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

disableRLS().catch(console.error);
