const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Disabling RLS on auth.users ===\n');
    console.log('Note: auth.users should NOT have RLS enabled.');
    console.log('The auth schema is already protected by Supabase Auth.\n');

    await pool.query(`ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;`);

    console.log('✓ Successfully disabled RLS on auth.users\n');

    // Verify
    const check = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'auth' AND tablename = 'users'
    `);

    if (check.rows.length > 0) {
      console.log('Verification:');
      console.log(`  Table: auth.${check.rows[0].tablename}`);
      console.log(`  RLS Enabled: ${check.rows[0].rowsecurity ? 'YES ⚠️' : 'NO ✓'}`);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
