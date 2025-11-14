require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkSchema() {
  console.log('Checking startup_profiles schema...\n');
  
  // Try to get one row to see column names
  const { data, error } = await supabase
    .from('startup_profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    if (data && data.length > 0) {
      console.log('Columns found:');
      Object.keys(data[0]).forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('No rows found. Trying to insert to see required columns...');
      
      const { error: insertError } = await supabase
        .from('startup_profiles')
        .insert({ id: 'test' });
      
      console.log('Insert error:', insertError);
    }
  }
}

checkSchema();
