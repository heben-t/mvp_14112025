const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugAuth() {
  try {
    await client.connect();
    console.log('🔍 Debugging Google OAuth Signup\n');
    console.log('═'.repeat(70));
    
    // 1. Check trigger exists and is active
    console.log('\n1️⃣  Checking Database Trigger...\n');
    const triggerCheck = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing,
        event_object_table,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_name = 'on_auth_user_created'
        AND event_object_schema = 'auth';
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('   ✅ Trigger EXISTS and is active');
      console.log(`      Event: ${triggerCheck.rows[0].event_manipulation}`);
      console.log(`      Timing: ${triggerCheck.rows[0].action_timing}`);
      console.log(`      On Table: auth.${triggerCheck.rows[0].event_object_table}`);
    } else {
      console.log('   ❌ TRIGGER NOT FOUND!');
      console.log('      This means users won\'t be created in public.users');
    }
    
    // 2. Check if there are ANY users in auth.users
    console.log('\n2️⃣  Checking auth.users (Supabase Auth Table)...\n');
    const authUsersCount = await client.query(`
      SELECT COUNT(*) as total FROM auth.users;
    `);
    console.log(`   Total users in auth.users: ${authUsersCount.rows[0].total}`);
    
    const recentAuthUsers = await client.query(`
      SELECT 
        id,
        email,
        created_at,
        confirmed_at,
        email_confirmed_at,
        last_sign_in_at,
        raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    if (recentAuthUsers.rows.length > 0) {
      console.log('\n   Recent auth.users entries:');
      recentAuthUsers.rows.forEach((user, i) => {
        console.log(`\n   ${i + 1}. ${user.email}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Created: ${user.created_at}`);
        console.log(`      Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`      Last Sign In: ${user.last_sign_in_at || 'Never'}`);
        console.log(`      Metadata:`, JSON.stringify(user.raw_user_meta_data, null, 2));
      });
    } else {
      console.log('   ⚠️  NO users found in auth.users!');
      console.log('      This means Google OAuth is NOT creating auth users at all');
    }
    
    // 3. Check public.users table
    console.log('\n3️⃣  Checking public.users (Your App Table)...\n');
    const publicUsersCount = await client.query(`
      SELECT COUNT(*) as total FROM public.users;
    `);
    console.log(`   Total users in public.users: ${publicUsersCount.rows[0].total}`);
    
    const recentPublicUsers = await client.query(`
      SELECT 
        id,
        email,
        role,
        name,
        "createdAt",
        "emailVerified"
      FROM public.users
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `);
    
    if (recentPublicUsers.rows.length > 0) {
      console.log('\n   Recent public.users entries:');
      recentPublicUsers.rows.forEach((user, i) => {
        console.log(`\n   ${i + 1}. ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Name: ${user.name}`);
        console.log(`      Created: ${user.createdAt}`);
      });
    } else {
      console.log('   ⚠️  NO users in public.users!');
    }
    
    // 4. Check for sync between tables
    console.log('\n4️⃣  Checking Sync Between Tables...\n');
    const syncCheck = await client.query(`
      SELECT 
        au.id,
        au.email as auth_email,
        pu.email as public_email,
        au.created_at as auth_created,
        pu."createdAt" as public_created,
        CASE 
          WHEN pu.id IS NULL THEN 'Missing in public.users'
          ELSE 'Synced'
        END as status
      FROM auth.users au
      LEFT JOIN public.users pu ON au.id::text = pu.id
      ORDER BY au.created_at DESC
      LIMIT 5;
    `);
    
    if (syncCheck.rows.length > 0) {
      console.log('   Sync Status:');
      syncCheck.rows.forEach((row, i) => {
        const icon = row.status === 'Synced' ? '✅' : '❌';
        console.log(`   ${icon} ${row.auth_email}: ${row.status}`);
      });
    } else {
      console.log('   No users to check sync for');
    }
    
    // 5. Check identities table (OAuth specific)
    console.log('\n5️⃣  Checking auth.identities (OAuth Providers)...\n');
    const identities = await client.query(`
      SELECT 
        id,
        user_id,
        provider,
        identity_data,
        created_at,
        last_sign_in_at
      FROM auth.identities
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    if (identities.rows.length > 0) {
      console.log(`   Found ${identities.rows.length} OAuth identities:`);
      identities.rows.forEach((identity, i) => {
        console.log(`\n   ${i + 1}. Provider: ${identity.provider}`);
        console.log(`      User ID: ${identity.user_id}`);
        console.log(`      Email: ${identity.identity_data?.email || 'N/A'}`);
        console.log(`      Created: ${identity.created_at}`);
        console.log(`      Last Sign In: ${identity.last_sign_in_at || 'Never'}`);
      });
    } else {
      console.log('   ❌ NO OAuth identities found!');
      console.log('      This means NO Google signups have succeeded');
    }
    
    // 6. Check database permissions
    console.log('\n6️⃣  Checking Database Permissions...\n');
    const permissions = await client.query(`
      SELECT 
        has_table_privilege('service_role', 'public.users', 'INSERT') as service_can_insert,
        has_table_privilege('authenticated', 'public.users', 'INSERT') as auth_can_insert,
        has_table_privilege('anon', 'public.users', 'SELECT') as anon_can_select;
    `);
    
    console.log('   Permissions:');
    console.log(`      service_role can INSERT: ${permissions.rows[0].service_can_insert ? '✅' : '❌'}`);
    console.log(`      authenticated can INSERT: ${permissions.rows[0].auth_can_insert ? '✅' : '❌'}`);
    console.log(`      anon can SELECT: ${permissions.rows[0].anon_can_select ? '✅' : '❌'}`);
    
    // 7. Test trigger manually
    console.log('\n7️⃣  Testing Trigger Manually...\n');
    console.log('   Creating test user to verify trigger works...');
    
    try {
      const testUserId = require('crypto').randomUUID();
      const testEmail = `test-${Date.now()}@trigger-test.com`;
      
      await client.query(`
        INSERT INTO auth.users (
          id, 
          email, 
          encrypted_password, 
          email_confirmed_at,
          raw_user_meta_data,
          created_at,
          updated_at,
          instance_id,
          aud,
          role
        )
        VALUES (
          $1,
          $2,
          crypt('testpassword123', gen_salt('bf')),
          NOW(),
          '{"role": "STARTUP", "name": "Test User"}'::jsonb,
          NOW(),
          NOW(),
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated'
        );
      `, [testUserId, testEmail]);
      
      console.log(`   ✅ Test user created in auth.users: ${testEmail}`);
      
      // Check if trigger created user in public.users
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const triggerResult = await client.query(`
        SELECT * FROM public.users WHERE id = $1;
      `, [testUserId]);
      
      if (triggerResult.rows.length > 0) {
        console.log('   ✅ TRIGGER WORKED! User created in public.users');
        console.log(`      Role: ${triggerResult.rows[0].role}`);
        console.log(`      Name: ${triggerResult.rows[0].name}`);
        
        // Clean up test user
        await client.query(`DELETE FROM auth.users WHERE id = $1;`, [testUserId]);
        console.log('   ✅ Test user cleaned up');
      } else {
        console.log('   ❌ TRIGGER FAILED! User NOT created in public.users');
        console.log('      The trigger exists but is not executing!');
      }
    } catch (err) {
      console.log('   ❌ Error testing trigger:', err.message);
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 DIAGNOSIS:\n');
    
    // Provide diagnosis
    const hasAuthUsers = parseInt(authUsersCount.rows[0].total) > 0;
    const hasPublicUsers = parseInt(publicUsersCount.rows[0].total) > 0;
    const hasTrigger = triggerCheck.rows.length > 0;
    const hasIdentities = identities.rows.length > 0;
    
    if (!hasAuthUsers && !hasIdentities) {
      console.log('❌ ISSUE: Google OAuth is NOT creating users in Supabase at all!');
      console.log('   → Check Supabase Dashboard: Is Google provider enabled?');
      console.log('   → Check Google Console: Are redirect URIs correct?');
      console.log('   → Check browser console for errors during OAuth flow');
    } else if (hasAuthUsers && !hasPublicUsers && hasTrigger) {
      console.log('❌ ISSUE: Users created in auth.users but trigger not syncing to public.users!');
      console.log('   → Trigger exists but may not be firing');
      console.log('   → Check Supabase logs for trigger errors');
    } else if (hasAuthUsers && hasPublicUsers) {
      console.log('✅ System appears to be working!');
      console.log('   → Users exist in both tables');
      console.log('   → May be a timing issue - try signup again');
    } else {
      console.log('⚠️  Mixed state detected - review the details above');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

debugAuth().catch(console.error);
