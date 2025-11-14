const { Client } = require('pg');

// Load environment variables
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

async function checkUserProfiles() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Check structure of user_profiles table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_profiles'
      ORDER BY ordinal_position;
    `);

    console.log('\nColumns in user_profiles table:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check for enums
    const enumResult = await client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      ORDER BY t.typname, e.enumsortorder;
    `);

    console.log('\nEnums:');
    let currentEnum = '';
    enumResult.rows.forEach(row => {
      if (currentEnum !== row.typname) {
        currentEnum = row.typname;
        console.log(`\n  ${currentEnum}:`);
      }
      console.log(`    - ${row.enumlabel}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUserProfiles();
