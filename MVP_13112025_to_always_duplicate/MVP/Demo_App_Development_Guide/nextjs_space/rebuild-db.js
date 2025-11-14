const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function rebuildDatabase() {
  const client = new Client({
    connectionString: "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'COMPLETE_DB_REBUILD.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔄 Executing database rebuild...');
    console.log('⚠️  This will DROP all existing tables!');
    
    // Execute SQL
    await client.query(sql);
    
    console.log('✅ Database rebuild completed successfully!');
    
    // Verify tables created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables created:');
    result.rows.forEach(row => console.log('  -', row.table_name));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

rebuildDatabase();
