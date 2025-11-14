const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Checking trigger on auth.users (INSERT) ===\n');

    const triggers = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        tgenabled as enabled,
        pg_get_triggerdef(oid) as definition
      FROM pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
        AND tgname LIKE '%auth_user%'
    `);

    if (triggers.rows.length > 0) {
      triggers.rows.forEach(row => {
        console.log(`Trigger: ${row.trigger_name}`);
        console.log(`Table: ${row.table_name}`);
        console.log(`Enabled: ${row.enabled === 'O' ? 'YES' : 'NO'}`);
        console.log(`Definition:\n${row.definition}`);
        console.log('');
      });
    } else {
      console.log('No triggers found on auth.users for new user creation');
    }

    console.log('\n=== Checking if we can access auth schema ===');
    try {
      const authCheck = await pool.query(`
        SELECT COUNT(*) as count FROM auth.users
      `);
      console.log(`✓ Can query auth.users (${authCheck.rows[0].count} users)`);
    } catch (err) {
      console.log(`✗ Cannot query auth.users: ${err.message}`);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
