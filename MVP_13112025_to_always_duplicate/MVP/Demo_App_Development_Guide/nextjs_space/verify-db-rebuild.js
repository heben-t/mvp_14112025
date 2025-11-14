const { Client } = require('pg');

async function verify() {
  const client = new Client({
    connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check UUID types
    const result = await client.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_name IN ('id', 'user_id', 'campaign_id', 'investor_profile_id', 'startup_profile_id')
      ORDER BY table_name, column_name
    `);
    
    console.log('\n📊 UUID Column Types:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name}: ${row.udt_name}`);
    });
    
    // Check RLS policies
    const policies = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public'
      GROUP BY tablename
      ORDER BY tablename
    `);
    
    console.log('\n🔒 RLS Policies:');
    policies.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.policy_count} policies`);
    });
    
  } finally {
    await client.end();
  }
}

verify();
