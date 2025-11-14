#!/usr/bin/env node

/**
 * Execute SQL directly in Supabase
 * This uses the service role key to run SQL commands
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

console.log('🚀 Executing Database Rebuild...\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Role Key: ${SERVICE_ROLE_KEY.substring(0, 20)}...\n`);

// Read SQL file
const sqlFile = path.join(__dirname, 'COMPLETE_DB_REBUILD_FRESH.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('📄 SQL file loaded');
console.log(`📏 SQL length: ${sql.length} characters\n`);

// Execute SQL using fetch to Supabase REST API
async function executeSql() {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  console.log('⚠️  WARNING: This will DELETE ALL DATA!\n');
  console.log('Starting in 3 seconds... Press Ctrl+C to cancel\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('🔄 Executing SQL...\n');

  // Split SQL into batches
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📦 Total statements: ${statements.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and verification queries
    if (statement.startsWith('/*') || 
        statement.toUpperCase().trim().startsWith('SELECT') ||
        statement.includes('VERIFICATION')) {
      continue;
    }

    // Show what we're doing
    if (statement.toUpperCase().includes('DROP TABLE')) {
      const match = statement.match(/DROP TABLE IF EXISTS (\w+)/i);
      if (match) console.log(`🗑️  Dropping: ${match[1]}`);
    } else if (statement.toUpperCase().includes('CREATE TABLE')) {
      const match = statement.match(/CREATE TABLE (\w+)/i);
      if (match) console.log(`✨ Creating: ${match[1]}`);
    } else if (statement.toUpperCase().includes('CREATE TYPE')) {
      const match = statement.match(/CREATE TYPE (\w+)/i);
      if (match) console.log(`🎨 Creating type: ${match[1]}`);
    } else if (statement.toUpperCase().includes('DISABLE ROW LEVEL SECURITY')) {
      const match = statement.match(/ALTER TABLE (\w+)/i);
      if (match) console.log(`🔓 Disabling RLS: ${match[1]}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          query: statement + ';'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Ignore "does not exist" errors during cleanup
        if (!errorText.includes('does not exist') && 
            !errorText.includes('already exists')) {
          console.error(`❌ Error: ${errorText.substring(0, 200)}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        console.error(`❌ Error: ${error.message.substring(0, 200)}`);
        errorCount++;
      }
    }

    // Progress
    if ((i + 1) % 20 === 0) {
      console.log(`📊 Progress: ${i + 1}/${statements.length}`);
    }
  }

  console.log(`\n✅ Execution complete!`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}\n`);

  console.log('🔍 Verifying tables...\n');

  // Verify tables exist
  const tables = [
    'users', 'accounts', 'sessions', 'startup_profiles', 
    'investor_profiles', 'campaigns', 'investments', 
    'startup_metrics', 'campaign_followers', 'campaign_comments'
  ];

  for (const table of tables) {
    const checkUrl = `${SUPABASE_URL}/rest/v1/${table}?limit=0`;
    try {
      const response = await fetch(checkUrl, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      });

      if (response.ok) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - not found`);
      }
    } catch (error) {
      console.log(`❌ ${table} - ${error.message}`);
    }
  }

  console.log('\n🎉 DATABASE REBUILD COMPLETE!\n');
  console.log('Next steps:');
  console.log('1. npx prisma db pull');
  console.log('2. npx prisma generate');
  console.log('3. Restart your dev server\n');
}

executeSql().catch(console.error);
