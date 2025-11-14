const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('\n🔧 Starting Supabase Auth Migration...\n');
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    // Read SQL file as single block
    const sql = fs.readFileSync('./FIX_SUPABASE_AUTH.sql', 'utf8');
    
    console.log('📋 Executing SQL migration script...\n');

    try {
      // Execute the entire SQL file as one statement
      const result = await client.query(sql);
      console.log('✅ Migration executed successfully!');
      
      if (result.rows && result.rows.length > 0) {
        console.log('\n📊 Result:', result.rows);
      }
    } catch (err) {
      console.error('❌ Error executing migration:', err.message);
      throw err;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 Migration completed successfully!');
    console.log(`${'='.repeat(60)}\n`);
    console.log('✨ Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000/auth/signup');
    console.log('   3. Test both Email and Google OAuth signup\n');
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed\n');
  }
}

// Run it
runMigration().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
