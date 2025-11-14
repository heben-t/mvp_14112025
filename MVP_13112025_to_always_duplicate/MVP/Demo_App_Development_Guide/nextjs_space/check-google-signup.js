const {Client} = require('pg');
require('dotenv').config({path: '.env.local'});

async function checkGoogleUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  
  await client.connect();
  console.log('🔍 Checking for Google OAuth user from logs...\n');
  
  const email = 'contact.hebedai@gmail.com';
  const userId = '5c9c07e6-800f-48de-85f9-db4eee6a396c';
  
  // Check auth.users
  const authCheck = await client.query(
    'SELECT id, email, created_at, raw_user_meta_data FROM auth.users WHERE email = $1 OR id = $2',
    [email, userId]
  );
  
  if (authCheck.rows.length > 0) {
    console.log('✅ FOUND in auth.users:');
    console.log('   Email:', authCheck.rows[0].email);
    console.log('   ID:', authCheck.rows[0].id);
    console.log('   Created:', authCheck.rows[0].created_at);
    console.log('   Metadata:', JSON.stringify(authCheck.rows[0].raw_user_meta_data, null, 2));
    
    // Check public.users
    const publicCheck = await client.query(
      'SELECT * FROM public.users WHERE id = $1 OR email = $2',
      [authCheck.rows[0].id.toString(), email]
    );
    
    console.log('\n📊 In public.users:', publicCheck.rows.length > 0 ? '✅ YES' : '❌ NO');
    
    if (publicCheck.rows.length > 0) {
      console.log('   ID:', publicCheck.rows[0].id);
      console.log('   Email:', publicCheck.rows[0].email);
      console.log('   Role:', publicCheck.rows[0].role);
      console.log('   Name:', publicCheck.rows[0].name);
      console.log('\n✅ User successfully synced to public.users!');
    } else {
      console.log('\n❌ Trigger FAILED to create user in public.users');
      console.log('   This means the trigger is not working properly');
    }
  } else {
    console.log('❌ User NOT found in auth.users');
    console.log('   The Google signup may have been rolled back');
  }
  
  // Check OAuth identities
  console.log('\n🔍 Checking OAuth identities...\n');
  const identities = await client.query(
    "SELECT provider, identity_data FROM auth.identities WHERE user_id = $1 OR identity_data->>'email' = $2",
    [userId, email]
  );
  
  if (identities.rows.length > 0) {
    console.log('✅ OAuth identity found:');
    identities.rows.forEach(identity => {
      console.log('   Provider:', identity.provider);
      console.log('   Email:', identity.identity_data?.email);
    });
  } else {
    console.log('❌ No OAuth identity found');
  }
  
  await client.end();
}

checkGoogleUser().catch(console.error);
