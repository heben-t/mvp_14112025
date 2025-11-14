const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== All triggers on auth.users ===\n');

    const triggers = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgenabled as enabled,
        tgtype,
        CASE
          WHEN tgtype & 2 = 2 THEN 'BEFORE'
          WHEN tgtype & 64 = 64 THEN 'INSTEAD OF'
          ELSE 'AFTER'
        END as timing,
        CASE
          WHEN tgtype & 4 = 4 THEN 'INSERT'
          WHEN tgtype & 8 = 8 THEN 'DELETE'
          WHEN tgtype & 16 = 16 THEN 'UPDATE'
          ELSE 'OTHER'
        END as event,
        pg_get_triggerdef(oid) as definition
      FROM pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
        AND NOT tgisinternal
      ORDER BY tgname
    `);

    if (triggers.rows.length > 0) {
      triggers.rows.forEach((row, idx) => {
        console.log(`[${idx + 1}] ${row.trigger_name}`);
        console.log(`    Enabled: ${row.enabled === 'O' ? 'YES' : 'NO'}`);
        console.log(`    Timing: ${row.timing}`);
        console.log(`    Event: ${row.event}`);
        console.log(`    Definition:\n    ${row.definition}\n`);
      });
    } else {
      console.log('No user-defined triggers found on auth.users');
    }

    console.log('\n=== Checking auth schema constraints ===\n');
    const constraints = await pool.query(`
      SELECT
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'auth.users'::regclass
      ORDER BY contype
    `);

    if (constraints.rows.length > 0) {
      constraints.rows.forEach(row => {
        const type = {
          'p': 'PRIMARY KEY',
          'f': 'FOREIGN KEY',
          'u': 'UNIQUE',
          'c': 'CHECK'
        }[row.constraint_type] || row.constraint_type;

        console.log(`[${type}] ${row.constraint_name}`);
        console.log(`  ${row.definition}\n`);
      });
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
