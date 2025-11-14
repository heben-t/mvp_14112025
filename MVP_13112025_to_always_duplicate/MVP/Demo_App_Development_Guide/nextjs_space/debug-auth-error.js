const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    // First, check current RLS status
    console.log('=== Current RLS Status ===\n');
    const rlsCheck = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'auth' AND tablename = 'users'
    `);
    console.log('auth.users RLS:', rlsCheck.rows[0].rowsecurity ? 'ENABLED ❌' : 'DISABLED ✓');

    // Check if we can see error logs
    console.log('\n=== Checking PostgreSQL logs (if accessible) ===\n');

    // Try to get more details on what might be failing
    console.log('=== Checking all constraints on auth.users ===\n');
    const constraints = await pool.query(`
      SELECT
        conname as name,
        contype as type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'auth.users'::regclass
      AND contype IN ('c', 'f', 'u')
      ORDER BY contype, conname
    `);

    if (constraints.rows.length > 0) {
      constraints.rows.forEach(row => {
        const typeMap = { c: 'CHECK', f: 'FOREIGN KEY', u: 'UNIQUE' };
        console.log(`[${typeMap[row.type]}] ${row.name}`);
        console.log(`  ${row.definition}\n`);
      });
    }

    // Check if there are any other triggers that might be failing
    console.log('=== All triggers on auth.users ===\n');
    const triggers = await pool.query(`
      SELECT
        tgname,
        tgenabled,
        pg_get_triggerdef(oid) as def
      FROM pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
    `);

    triggers.rows.forEach(row => {
      console.log(`Trigger: ${row.tgname}`);
      console.log(`Enabled: ${row.tgenabled === 'O' ? 'YES' : 'NO'}`);
      console.log(`${row.def}\n`);
    });

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
