const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAuthUsers() {
  try {
    await client.connect();
    console.log('🔍 Checking auth.users table...\n');
    
    // Check recent auth users
    const authUsers = await client.query(`
      SELECT 
        id,
        email,
        created_at,
        email_confirmed_at,
        raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    console.log(`Found ${authUsers.rows.length} recent auth users:\n`);
    authUsers.rows.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Metadata:`, user.raw_user_meta_data);
      console.log('');
    });
    
    // Check public.users
    const publicUsers = await client.query(`
      SELECT id, email, role, name, "createdAt"
      FROM public.users
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `);
    
    console.log(`Found ${publicUsers.rows.length} users in public.users:\n`);
    publicUsers.rows.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.name}`);
      console.log('');
    });
    
    // Check for orphaned users
    const orphaned = await client.query(`
      SELECT au.email, au.id as auth_id
      FROM auth.users au
      LEFT JOIN public.users pu ON au.id::text = pu.id
      WHERE pu.id IS NULL
      ORDER BY au.created_at DESC
      LIMIT 5;
    `);
    
    if (orphaned.rows.length > 0) {
      console.log(`⚠️  Found ${orphaned.rows.length} orphaned users (in auth.users but NOT in public.users):\n`);
      orphaned.rows.forEach((user, i) => {
        console.log(`${i + 1}. ${user.email} (${user.auth_id})`);
      });
    } else {
      console.log('✅ No orphaned users found\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAuthUsers().catch(console.error);
