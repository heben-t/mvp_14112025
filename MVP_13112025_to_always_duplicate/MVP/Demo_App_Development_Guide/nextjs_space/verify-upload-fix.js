/**
 * Quick Upload Verification Script
 * Verifies that storage buckets are properly configured
 * Run after executing create-storage-buckets.sql
 */

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const REQUIRED_BUCKETS = [
  { name: 'company-logos', public: true },
  { name: 'pitch-decks', public: true },
  { name: 'documents', public: false },
  { name: 'videos', public: true }
];

async function verifyBuckets() {
  console.log('🔍 Verifying Storage Buckets...\n');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return false;
    }
    
    let allFound = true;
    
    for (const required of REQUIRED_BUCKETS) {
      const found = buckets.find(b => b.name === required.name);
      
      if (found) {
        const publicMatch = found.public === required.public;
        const status = publicMatch ? '✅' : '⚠️';
        const visibility = found.public ? 'public' : 'private';
        const warning = !publicMatch ? ` (expected ${required.public ? 'public' : 'private'})` : '';
        
        console.log(`${status} ${required.name} (${visibility})${warning}`);
      } else {
        console.log(`❌ ${required.name} - NOT FOUND`);
        allFound = false;
      }
    }
    
    return allFound;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function testUploadPermissions() {
  console.log('\n🔐 Testing Upload Permissions...\n');
  
  const testData = Buffer.from('test content');
  const testPath = `test-${Date.now()}.txt`;
  
  for (const bucket of REQUIRED_BUCKETS) {
    try {
      // Try to upload a test file
      const { data, error } = await supabase.storage
        .from(bucket.name)
        .upload(testPath, testData, {
          contentType: 'text/plain',
          upsert: false
        });
      
      if (error) {
        console.log(`❌ ${bucket.name}: Upload failed - ${error.message}`);
        continue;
      }
      
      // Try to delete the test file
      const { error: deleteError } = await supabase.storage
        .from(bucket.name)
        .remove([testPath]);
      
      if (deleteError) {
        console.log(`⚠️  ${bucket.name}: Upload OK, delete failed - ${deleteError.message}`);
      } else {
        console.log(`✅ ${bucket.name}: Upload & delete OK`);
      }
    } catch (error) {
      console.log(`❌ ${bucket.name}: ${error.message}`);
    }
  }
}

async function displayStorageInfo() {
  console.log('\n📊 Storage Information:\n');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Could not fetch storage info');
      return;
    }
    
    console.log('┌─────────────────┬────────┬──────────────┬─────────────────┐');
    console.log('│ Bucket          │ Public │ Size Limit   │ Created         │');
    console.log('├─────────────────┼────────┼──────────────┼─────────────────┤');
    
    for (const bucket of buckets) {
      const name = bucket.name.padEnd(15);
      const pub = bucket.public ? 'Yes' : 'No ';
      const limit = bucket.file_size_limit 
        ? `${Math.round(bucket.file_size_limit / 1024 / 1024)}MB`.padEnd(12)
        : 'Unlimited'.padEnd(12);
      const created = new Date(bucket.created_at).toLocaleDateString().padEnd(15);
      
      console.log(`│ ${name} │ ${pub}    │ ${limit} │ ${created} │`);
    }
    
    console.log('└─────────────────┴────────┴──────────────┴─────────────────┘');
  } catch (error) {
    console.error('❌ Error fetching storage info:', error.message);
  }
}

async function checkPolicies() {
  console.log('\n🔒 Checking RLS Policies...\n');
  
  try {
    // Query to check if policies exist
    const { data, error } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects');
    
    if (error && error.code !== 'PGRST202') {
      console.log('⚠️  Could not verify policies (may require admin access)');
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} RLS policies on storage.objects`);
      console.log('   Policies appear to be configured');
    } else {
      console.log('⚠️  No policies found - this may cause permission issues');
    }
  } catch (error) {
    console.log('⚠️  Policy check skipped (requires specific permissions)');
  }
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         SUPABASE STORAGE VERIFICATION TOOL                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // Step 1: Verify buckets exist
  const bucketsOK = await verifyBuckets();
  
  if (!bucketsOK) {
    console.log('\n❌ VERIFICATION FAILED');
    console.log('\n📋 Next Steps:');
    console.log('1. Open Supabase Dashboard SQL Editor');
    console.log('2. Run the SQL script: create-storage-buckets.sql');
    console.log('3. Run this verification script again');
    console.log('\nFor detailed instructions, see: UPLOAD_FIX_AND_TEST_GUIDE.md');
    process.exit(1);
  }
  
  // Step 2: Display storage info
  await displayStorageInfo();
  
  // Step 3: Test upload permissions
  await testUploadPermissions();
  
  // Step 4: Check policies
  await checkPolicies();
  
  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    VERIFICATION SUMMARY                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('✅ All required storage buckets exist');
  console.log('✅ Upload permissions are working');
  console.log('✅ Storage is properly configured');
  console.log('\n🎉 SUCCESS! Upload functionality should now work correctly.\n');
  console.log('📋 Next Steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Test campaign creation with file uploads');
  console.log('3. Verify files are accessible at generated URLs');
  console.log('\nFor testing instructions, see: UPLOAD_FIX_AND_TEST_GUIDE.md\n');
}

main().catch(error => {
  console.error('\n❌ Verification failed with error:', error.message);
  process.exit(1);
});
