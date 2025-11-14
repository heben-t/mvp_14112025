const {Client} = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env.local'});

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  
  await client.connect();
  console.log('Fixing trigger UUID cast...\n');
  
  const sql = fs.readFileSync('FIX_TRIGGER_UUID_CAST.sql', 'utf8');
  await client.query(sql);
  
  console.log('✅ Trigger fixed!\n');
  
  const check = await client.query("SELECT prosrc FROM pg_proc WHERE proname='handle_new_user'");
  const hasCast = check.rows[0].prosrc.includes('NEW.id::text');
  console.log('UUID cast present:', hasCast ? '✅' : '❌');
  
  await client.end();
}

main().catch(console.error);
