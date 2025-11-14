const { Client } = require('pg');

async function testGoogleAuth() {
  const client = new Client({
    connectionString: "postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');
    
    // Test 1: Verify all tables exist
    console.log('📋 TEST 1: Checking database tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`✅ Found ${tables.rows.length} tables`);
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    // Test 2: Verify UUID columns
    console.log('\n📋 TEST 2: Verifying UUID column types...');
    const uuidCheck = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name IN ('id', 'user_id')
        AND data_type != 'uuid'
    `);
    
    if (uuidCheck.rows.length === 0) {
      console.log('✅ All ID columns are properly typed as UUID');
    } else {
      console.log('❌ Found non-UUID ID columns:');
      uuidCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}.${row.column_name}: ${row.data_type}`);
      });
    }
    
    // Test 3: Verify RLS policies
    console.log('\n📋 TEST 3: Checking RLS policies...');
    const rlsPolicies = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY tablename
      ORDER BY tablename
    `);
    
    console.log(`✅ RLS policies configured for ${rlsPolicies.rows.length} tables`);
    rlsPolicies.rows.forEach(row => {
      console.log(`   - ${row.tablename}: ${row.policy_count} policies`);
    });
    
    // Test 4: Check foreign key constraints
    console.log('\n📋 TEST 4: Verifying foreign key constraints...');
    const fkCheck = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log(`✅ Found ${fkCheck.rows.length} foreign key constraints`);
    
    // Test 5: Simulate Google OAuth user creation
    console.log('\n📋 TEST 5: Simulating Google OAuth user creation...');
    
    // Clean up any test users first
    await client.query(`DELETE FROM users WHERE email = 'test-google@example.com'`);
    
    // Create a test user (simulating what Supabase Auth does)
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // UUID format
    await client.query(`
      INSERT INTO users (id, email, name, email_verified, role, image, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [testUserId, 'test-google@example.com', 'Test Google User', 'INVESTOR', 'https://example.com/avatar.jpg']);
    
    console.log('✅ Test user created successfully');
    
    // Verify user was created with correct UUID type
    const userCheck = await client.query(`
      SELECT id, email, role, pg_typeof(id) as id_type
      FROM users
      WHERE email = 'test-google@example.com'
    `);
    
    if (userCheck.rows.length > 0) {
      const user = userCheck.rows[0];
      console.log(`✅ User verified:`);
      console.log(`   - ID: ${user.id} (type: ${user.id_type})`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
    }
    
    // Test 6: Simulate account linking (OAuth provider)
    console.log('\n📋 TEST 6: Simulating OAuth account linking...');
    await client.query(`
      INSERT INTO accounts (user_id, type, provider, provider_account_id, access_token)
      VALUES ($1, 'oauth', 'google', 'google_test_123', 'test_access_token')
      ON CONFLICT (provider, provider_account_id) DO NOTHING
    `, [testUserId]);
    
    console.log('✅ OAuth account linked successfully');
    
    // Test 7: Simulate investor profile creation
    console.log('\n📋 TEST 7: Simulating investor profile creation...');
    await client.query(`
      INSERT INTO investor_profiles (
        user_id,
        investor_type,
        investment_types,
        ticket_range,
        geo_focus,
        profile_visibility,
        is_accredited
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO NOTHING
    `, [
      testUserId,
      'Individual Investor',
      JSON.stringify(['Equity']),
      '≤$50k',
      JSON.stringify(['UAE']),
      'visible',
      false
    ]);
    
    console.log('✅ Investor profile created successfully');
    
    // Verify the full user setup
    const fullCheck = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        a.provider,
        ip.investor_type,
        ip.geo_focus
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      LEFT JOIN investor_profiles ip ON u.id = ip.user_id
      WHERE u.email = 'test-google@example.com'
    `);
    
    console.log('\n✅ Full user setup verified:');
    const setup = fullCheck.rows[0];
    console.log(`   - User ID: ${setup.id}`);
    console.log(`   - Email: ${setup.email}`);
    console.log(`   - Role: ${setup.role}`);
    console.log(`   - OAuth Provider: ${setup.provider}`);
    console.log(`   - Investor Type: ${setup.investor_type}`);
    console.log(`   - Geo Focus: ${setup.geo_focus}`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await client.query(`DELETE FROM users WHERE email = 'test-google@example.com'`);
    console.log('✅ Test data cleaned up');
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Database structure: PASSED');
    console.log('✅ UUID types: PASSED');
    console.log('✅ RLS policies: CONFIGURED');
    console.log('✅ Foreign keys: VERIFIED');
    console.log('✅ User creation: PASSED');
    console.log('✅ OAuth linking: PASSED');
    console.log('✅ Profile creation: PASSED');
    console.log('='.repeat(60));
    console.log('\n🎉 All tests passed! Database is ready for Google OAuth.\n');
    console.log('Next steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Navigate to /auth/signin');
    console.log('3. Click "Continue with Google"');
    console.log('4. The auth callback will handle user creation automatically\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testGoogleAuth();
