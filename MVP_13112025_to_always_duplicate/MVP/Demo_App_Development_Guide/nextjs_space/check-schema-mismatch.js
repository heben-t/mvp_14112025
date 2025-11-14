const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('🔍 Checking Schema Type Mismatch\n');
    
    const authSchema = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id';
    `);
    
    const publicSchema = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id';
    `);
    
    console.log('auth.users.id:');
    console.log(`  Type: ${authSchema.rows[0].data_type}`);
    console.log(`  UDT: ${authSchema.rows[0].udt_name}\n`);
    
    console.log('public.users.id:');
    console.log(`  Type: ${publicSchema.rows[0].data_type}`);
    console.log(`  UDT: ${publicSchema.rows[0].udt_name}\n`);
    
    if (authSchema.rows[0].data_type !== publicSchema.rows[0].data_type) {
      console.log('❌ TYPE MISMATCH FOUND!');
      console.log('   This is causing the trigger to fail!\n');
      console.log('Solution: Update trigger to cast types correctly');
    } else {
      console.log('✅ Types match');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema().catch(console.error);
