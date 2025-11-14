const { Client } = require('pg');

// Load environment variables
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

async function createMissingTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Create missing tables
    console.log('\n Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" user_role NOT NULL,
        "name" TEXT,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Users table created');

    console.log('\nCreating unique index on users.email...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `);
    console.log('✓ Index created');

    console.log('\nCreating accounts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Accounts table created');

    console.log('\nCreating unique index on accounts...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key"
      ON "accounts"("provider", "providerAccountId");
    `);
    console.log('✓ Index created');

    console.log('\nCreating sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Sessions table created');

    console.log('\nCreating unique index on sessions...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key"
      ON "sessions"("sessionToken");
    `);
    console.log('✓ Index created');

    console.log('\nCreating verification_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `);
    console.log('✓ Verification_tokens table created');

    console.log('\nCreating indexes on verification_tokens...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key"
      ON "verification_tokens"("token");
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key"
      ON "verification_tokens"("identifier", "token");
    `);
    console.log('✓ Indexes created');

    console.log('\nCreating watchlists table (if not exists)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "watchlists" (
        "id" TEXT NOT NULL,
        "investorProfileId" TEXT NOT NULL,
        "campaignId" TEXT NOT NULL,
        "alertOnMetricChange" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Watchlists table created');

    console.log('\nCreating unique index on watchlists...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "watchlists_investorProfileId_campaignId_key"
      ON "watchlists"("investorProfileId", "campaignId");
    `);
    console.log('✓ Index created');

    console.log('\nAdding foreign keys...');
    try {
      await client.query(`
        ALTER TABLE "accounts"
        ADD CONSTRAINT "accounts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✓ accounts_userId_fkey added');
    } catch (e) {
      if (e.code === '42710') {
        console.log('✓ accounts_userId_fkey already exists');
      } else {
        console.log('⚠ accounts_userId_fkey error:', e.message);
      }
    }

    try {
      await client.query(`
        ALTER TABLE "sessions"
        ADD CONSTRAINT "sessions_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✓ sessions_userId_fkey added');
    } catch (e) {
      if (e.code === '42710') {
        console.log('✓ sessions_userId_fkey already exists');
      } else {
        console.log('⚠ sessions_userId_fkey error:', e.message);
      }
    }

    try {
      await client.query(`
        ALTER TABLE "watchlists"
        ADD CONSTRAINT "watchlists_investorProfileId_fkey"
        FOREIGN KEY ("investorProfileId") REFERENCES "investor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log('✓ watchlists_investorProfileId_fkey added');
    } catch (e) {
      if (e.code === '42710') {
        console.log('✓ watchlists_investorProfileId_fkey already exists');
      } else {
        console.log('⚠ watchlists_investorProfileId_fkey error:', e.message);
      }
    }

    console.log('\n✅ All missing tables created successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await client.end();
  }
}

createMissingTables();
