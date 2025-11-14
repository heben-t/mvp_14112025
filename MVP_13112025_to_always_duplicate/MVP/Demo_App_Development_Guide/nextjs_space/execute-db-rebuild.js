#!/usr/bin/env node

/**
 * Execute Database Rebuild using direct PostgreSQL connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

async function main() {
  console.log('\n🚀 HEBED AI - Complete Database Rebuild\n');
  console.log('⚠️  WARNING: This will DELETE ALL DATA!');
  console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🔌 Connecting to database...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'COMPLETE_DB_REBUILD_FRESH.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Executing SQL script...\n');

    // Execute the entire script
    await client.query(sql);

    console.log('✅ SQL executed successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...\n');

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${result.rows.length} tables:\n`);
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check RLS status
    console.log('\n🔓 Checking RLS status...\n');

    const rlsResult = await client.query(`
      SELECT 
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    rlsResult.rows.forEach(row => {
      const status = row.rls_enabled ? '🔒 ENABLED' : '🔓 DISABLED';
      console.log(`  ${status} - ${row.tablename}`);
    });

    console.log('\n✅ DATABASE REBUILD COMPLETE!\n');
    console.log('Next steps:');
    console.log('  1. npx prisma db pull');
    console.log('  2. npx prisma generate');
    console.log('  3. Restart your development server\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
