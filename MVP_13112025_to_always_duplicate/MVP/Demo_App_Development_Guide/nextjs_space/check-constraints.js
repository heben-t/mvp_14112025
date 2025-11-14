const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Getting table constraints ===\n');
    const constraints = await pool.query(`
      SELECT
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.user_profiles'::regclass
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
        console.log(`  ${row.definition}`);
        console.log('');
      });
    } else {
      console.log('No constraints found');
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
