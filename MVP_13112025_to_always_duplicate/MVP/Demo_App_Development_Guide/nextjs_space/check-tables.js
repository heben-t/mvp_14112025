const { Client } = require('pg');

// Load environment variables
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // List all tables in the public schema
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nExisting tables in public schema:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log(`\nTotal: ${result.rows.length} tables`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTables();
