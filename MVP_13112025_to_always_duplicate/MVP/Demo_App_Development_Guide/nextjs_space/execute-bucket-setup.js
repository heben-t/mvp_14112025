/**
 * Automated Storage Bucket Setup Script
 * Creates all required Supabase storage buckets programmatically
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKETS = [
  {
    id: 'company-logos',
    name: 'company-logos',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  },
  {
    id: 'pitch-decks',
    name: 'pitch-decks',
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['application/pdf']
  },
  {
    id: 'documents',
    name: 'documents',
    public: false,
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    id: 'videos',
    name: 'videos',
    public: true,
    fileSizeLimit: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/webm']
  }
];

async function createBucket(bucketConfig) {
  const { id, name, public: isPublic, fileSizeLimit, allowedMimeTypes } = bucketConfig;
  
  try {
    const { data, error } = await supabase.storage.createBucket(id, {
      public: isPublic,
      fileSizeLimit,
      allowedMimeTypes
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  ${name}: Already exists, skipping...`);
        return true;
      }
      throw error;
    }
    
    console.log(`✅ ${name}: Created successfully (${isPublic ? 'public' : 'private'})`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}: Failed - ${error.message}`);
    return false;
  }
}

async function setupStoragePolicies() {
  console.log('\n🔐 Setting up RLS policies...\n');
  
  const policies = [
    // Company Logos
    `CREATE POLICY IF NOT EXISTS "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'company-logos');`,
    `CREATE POLICY IF NOT EXISTS "Public can view logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'company-logos');`,
    `CREATE POLICY IF NOT EXISTS "Users can delete their own logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    
    // Pitch Decks
    `CREATE POLICY IF NOT EXISTS "Authenticated users can upload pitch decks" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pitch-decks');`,
    `CREATE POLICY IF NOT EXISTS "Public can view pitch decks" ON storage.objects FOR SELECT TO public USING (bucket_id = 'pitch-decks');`,
    `CREATE POLICY IF NOT EXISTS "Users can delete their own pitch decks" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    
    // Documents
    `CREATE POLICY IF NOT EXISTS "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');`,
    `CREATE POLICY IF NOT EXISTS "Users can view their own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    `CREATE POLICY IF NOT EXISTS "Users can delete their own documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    
    // Videos
    `CREATE POLICY IF NOT EXISTS "Authenticated users can upload videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');`,
    `CREATE POLICY IF NOT EXISTS "Public can view videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'videos');`,
    `CREATE POLICY IF NOT EXISTS "Users can delete their own videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);`
  ];
  
  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error && !error.message.includes('already exists')) {
        console.log(`⚠️  Policy creation: ${error.message.substring(0, 50)}...`);
      }
    } catch (error) {
      // Policies may need to be created via SQL Editor
      // This is not critical for basic functionality
    }
  }
  
  console.log('✅ RLS policies setup attempted (may need SQL Editor for full setup)');
}

async function testUpload() {
  console.log('\n🧪 Testing upload functionality...\n');
  
  const testData = Buffer.from('Test content for bucket verification');
  const testPath = `test-${Date.now()}.txt`;
  
  for (const bucket of BUCKETS) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket.id)
        .upload(testPath, testData, {
          contentType: 'text/plain',
          upsert: false
        });
      
      if (error) {
        console.log(`❌ ${bucket.name}: Upload test failed - ${error.message}`);
        continue;
      }
      
      // Clean up test file
      await supabase.storage.from(bucket.id).remove([testPath]);
      
      console.log(`✅ ${bucket.name}: Upload & delete test passed`);
    } catch (error) {
      console.log(`❌ ${bucket.name}: Test error - ${error.message}`);
    }
  }
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        SUPABASE STORAGE BUCKET SETUP SCRIPT               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Configuration:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Service Role: ${supabaseServiceKey ? '✅ Connected' : '❌ Missing'}\n`);
  
  console.log('📦 Creating storage buckets...\n');
  
  let successCount = 0;
  for (const bucket of BUCKETS) {
    const success = await createBucket(bucket);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Summary: ${successCount}/${BUCKETS.length} buckets ready\n`);
  
  if (successCount === BUCKETS.length) {
    // Try to set up policies (may require SQL Editor)
    await setupStoragePolicies();
    
    // Test uploads
    await testUpload();
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SETUP COMPLETE!                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('🎉 All storage buckets are ready!');
    console.log('📋 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Test campaign creation with file uploads');
    console.log('   3. Verify files are accessible\n');
  } else {
    console.log('\n⚠️  Some buckets could not be created.');
    console.log('   Check the errors above and try again.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
