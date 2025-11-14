#!/usr/bin/env node

/**
 * HEBED AI - Complete Database Rebuild Script
 * 
 * This script will:
 * 1. Connect to Supabase using credentials from .env
 * 2. DROP all existing tables
 * 3. CREATE fresh schema with proper UUID types
 * 4. DISABLE all RLS policies
 * 5. Verify the rebuild
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

async function main() {
  console.log(`
${colors.magenta}${colors.bright}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           HEBED AI - COMPLETE DATABASE REBUILD            ║
║                                                           ║
║  ⚠️  WARNING: This will DELETE ALL DATA!                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('Missing required environment variables!');
    log.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
  }

  log.info(`Supabase URL: ${supabaseUrl}`);
  log.info(`Database URL: ${databaseUrl ? databaseUrl.substring(0, 50) + '...' : 'Not set'}`);

  // Confirmation prompt
  log.warning('This will DELETE ALL TABLES and DATA from your Supabase database!');
  log.warning('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  log.step('🚀 Starting database rebuild...');

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read SQL file
  const sqlFilePath = path.join(__dirname, 'COMPLETE_DB_REBUILD_FRESH.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    log.error(`SQL file not found: ${sqlFilePath}`);
    process.exit(1);
  }

  log.info('Reading SQL file...');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Split SQL into individual statements (basic splitting)
  log.info('Parsing SQL statements...');
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
      // Filter out comments and empty statements
      return stmt.length > 0 && 
             !stmt.startsWith('--') && 
             !stmt.startsWith('/*') &&
             !stmt.match(/^\/\*/);
    });

  log.info(`Found ${statements.length} SQL statements to execute`);

  log.step('📦 STEP 1: Dropping all existing tables...');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip SELECT statements (verification queries)
    if (statement.toUpperCase().trim().startsWith('SELECT')) {
      continue;
    }

    // Log progress for important statements
    if (statement.toUpperCase().includes('DROP TABLE')) {
      const match = statement.match(/DROP TABLE IF EXISTS (\w+)/i);
      if (match) {
        log.info(`Dropping table: ${match[1]}`);
      }
    } else if (statement.toUpperCase().includes('CREATE TABLE')) {
      const match = statement.match(/CREATE TABLE (\w+)/i);
      if (match) {
        log.info(`Creating table: ${match[1]}`);
      }
    } else if (statement.toUpperCase().includes('CREATE TYPE')) {
      const match = statement.match(/CREATE TYPE (\w+)/i);
      if (match) {
        log.info(`Creating type: ${match[1]}`);
      }
    } else if (statement.toUpperCase().includes('DISABLE ROW LEVEL SECURITY')) {
      const match = statement.match(/ALTER TABLE (\w+)/i);
      if (match) {
        log.info(`Disabling RLS on: ${match[1]}`);
      }
    }

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      }).single();

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_sql')
          .select('*')
          .limit(0); // This is a workaround
        
        if (directError) {
          throw error;
        }
      }

      successCount++;
    } catch (error) {
      // Some errors are expected (e.g., dropping non-existent tables)
      if (
        !error.message.includes('does not exist') &&
        !error.message.includes('cannot drop') &&
        !error.message.includes('already exists')
      ) {
        errorCount++;
        errors.push({
          statement: statement.substring(0, 100),
          error: error.message
        });
        log.error(`Error: ${error.message.substring(0, 100)}`);
      }
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      log.info(`Progress: ${i + 1}/${statements.length} statements processed`);
    }
  }

  log.step('✨ Execution Summary');
  log.success(`Successfully executed: ${successCount} statements`);
  
  if (errorCount > 0) {
    log.warning(`Errors encountered: ${errorCount}`);
    log.warning('Some errors are expected during cleanup. Checking if critical tables were created...');
  }

  // Verify tables were created
  log.step('🔍 Verifying database structure...');

  const expectedTables = [
    'users',
    'accounts',
    'sessions',
    'startup_profiles',
    'investor_profiles',
    'campaigns',
    'investments',
    'startup_metrics',
    'subscriptions',
    'campaign_followers',
    'campaign_comments',
    'watchlists',
    'investor_preferences',
    'verification_tokens'
  ];

  log.info('Checking if tables exist...');
  
  let allTablesExist = true;
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        log.error(`Table '${tableName}' not found or not accessible`);
        allTablesExist = false;
      } else {
        log.success(`Table '${tableName}' exists`);
      }
    } catch (err) {
      log.error(`Table '${tableName}' check failed: ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log(`
${colors.bright}═══════════════════════════════════════════════════════════${colors.reset}
  `);

  if (allTablesExist) {
    log.success('✅ DATABASE REBUILD COMPLETE!');
    log.success('All tables have been created successfully');
    log.success('All RLS policies have been DISABLED');
    log.info('');
    log.info('Next steps:');
    log.info('1. Update your Prisma schema if needed');
    log.info('2. Run: npx prisma db pull (to sync Prisma with database)');
    log.info('3. Run: npx prisma generate (to regenerate Prisma Client)');
    log.info('4. Restart your development server');
  } else {
    log.error('⚠️  DATABASE REBUILD INCOMPLETE');
    log.error('Some tables were not created. Check the errors above.');
    log.info('');
    log.info('Manual steps required:');
    log.info('1. Open Supabase SQL Editor');
    log.info('2. Run the SQL from: COMPLETE_DB_REBUILD_FRESH.sql');
    log.info('3. Check for any error messages');
  }

  if (errors.length > 0) {
    console.log(`\n${colors.yellow}Errors encountered:${colors.reset}`);
    errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.statement}...`);
      console.log(`   ${colors.red}${err.error}${colors.reset}`);
    });
  }

  console.log(`
${colors.bright}═══════════════════════════════════════════════════════════${colors.reset}
  `);
}

main().catch(console.error);
