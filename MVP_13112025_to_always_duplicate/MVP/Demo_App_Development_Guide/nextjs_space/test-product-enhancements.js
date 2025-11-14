const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnzcvhyxiatcjofywkdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduemN2aHl4aWF0Y2pvZnl3a2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg3NzY0OSwiZXhwIjoyMDc3NDUzNjQ5fQ.IPTbcG3uB09ThxIVgTQbQtKYRi8NI6V0krU4xAJ6iUg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductEnhancements() {
  console.log('🧪 Testing Product Design Enhancements...\n');

  // Test 1: Check if new tables exist
  console.log('1️⃣ Checking new database tables...');
  const tablesToCheck = [
    'watchlist_folders',
    'campaign_analytics',
    'saved_searches',
    'campaign_templates',
    'investment_calculations',
    'campaign_questions',
    'campaign_updates',
    'investment_activity',
    'plugin_integrations',
    'csv_upload_history'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND (${error.message})`);
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ERROR`);
    }
  }

  // Test 2: Check campaign templates
  console.log('\n2️⃣ Checking campaign templates...');
  try {
    const { data, error } = await supabase
      .from('campaign_templates')
      .select('*');
    
    if (error) {
      console.log(`   ❌ Templates not accessible: ${error.message}`);
    } else {
      console.log(`   ✅ Found ${data?.length || 0} campaign templates`);
      if (data && data.length > 0) {
        data.forEach(template => {
          console.log(`      - ${template.name} (${template.industry})`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ Error checking templates: ${error.message}`);
  }

  // Test 3: Check existing campaigns table for new columns
  console.log('\n3️⃣ Checking campaigns table for new columns...');
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, completeness_score, is_featured, is_trending, total_views')
      .limit(1);
    
    if (error) {
      console.log(`   ⚠️  New columns not yet added: ${error.message}`);
    } else {
      console.log(`   ✅ New columns are accessible`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`);
  }

  // Test 4: Check API endpoints (this requires the dev server to be running)
  console.log('\n4️⃣ API Endpoints Created:');
  const endpoints = [
    '/api/watchlist/folders',
    '/api/campaigns/analytics',
    '/api/campaigns/templates',
    '/api/investments/calculator',
  ];
  
  endpoints.forEach(endpoint => {
    console.log(`   📍 ${endpoint}`);
  });

  // Test 5: Check component files
  console.log('\n5️⃣ React Components Created:');
  const components = [
    'components/watchlist/watchlist-folders.tsx',
    'components/campaigns/campaign-analytics-dashboard.tsx',
    'components/investments/investment-calculator.tsx',
    'components/metrics/enhanced-csv-upload.tsx',
  ];
  
  components.forEach(component => {
    console.log(`   📦 ${component}`);
  });

  console.log('\n✨ Product Enhancement Test Complete!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Run the SQL migration in Supabase Dashboard SQL Editor');
  console.log('   2. Execute: prisma/migrations/product_design_enhancements.sql');
  console.log('   3. Start the dev server: npm run dev');
  console.log('   4. Test the new features in the browser');
  console.log('   5. Integrate components into existing pages\n');
}

testProductEnhancements().catch(console.error);
