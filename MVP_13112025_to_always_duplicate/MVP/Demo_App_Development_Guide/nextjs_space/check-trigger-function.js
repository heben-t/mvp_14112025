const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTriggerFunction() {
  try {
    await client.connect();
    console.log('🔍 Checking Trigger Function Code\n');
    
    // Get the trigger function source code
    const functionCode = await client.query(`
      SELECT 
        p.proname as function_name,
        pg_get_functiondef(p.oid) as function_definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'handle_new_user';
    `);
    
    if (functionCode.rows.length > 0) {
      console.log('✅ Function found!\n');
      console.log('Function Definition:');
      console.log('─'.repeat(70));
      console.log(functionCode.rows[0].function_definition);
      console.log('─'.repeat(70));
    } else {
      console.log('❌ Function NOT found!');
    }
    
    // Check if the function has proper permissions
    console.log('\n\n🔐 Checking Function Permissions...\n');
    const permissions = await client.query(`
      SELECT 
        proname,
        prosecdef as is_security_definer,
        provolatile,
        proacl
      FROM pg_proc
      WHERE proname = 'handle_new_user';
    `);
    
    if (permissions.rows.length > 0) {
      console.log(`Security Definer: ${permissions.rows[0].is_security_definer ? '✅ YES' : '❌ NO'}`);
      console.log(`Volatility: ${permissions.rows[0].provolatile}`);
      console.log(`ACL: ${permissions.rows[0].proacl || 'Default'}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTriggerFunction().catch(console.error);
