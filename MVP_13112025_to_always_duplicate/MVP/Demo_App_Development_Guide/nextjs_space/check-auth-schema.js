const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== auth.users table columns ===\n');
    const authSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    authSchema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}${row.is_nullable === 'NO' ? ' (NOT NULL)' : ''}`);
    });

    console.log('\n=== Testing trigger function manually ===\n');

    // Test the function logic with sample data
    try {
      await pool.query('BEGIN');

      console.log('Testing JSONB extraction and cast...');
      const testJson = await pool.query(`
        SELECT
          '{"role": "STARTUP"}'::jsonb->>'role' as extracted_role,
          ('{"role": "STARTUP"}'::jsonb->>'role')::user_role as casted_role
      `);
      console.log('✓ JSONB extraction works:', testJson.rows[0]);

      await pool.query('ROLLBACK');
    } catch (err) {
      await pool.query('ROLLBACK');
      console.log('✗ JSONB test failed:', err.message);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
