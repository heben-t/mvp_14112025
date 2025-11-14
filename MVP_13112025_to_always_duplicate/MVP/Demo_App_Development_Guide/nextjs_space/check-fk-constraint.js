const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    // Check foreign key constraint definition
    console.log('=== Foreign Key Constraint Details ===\n');
    const fkQuery = await pool.query(`
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_name = 'startup_profiles_user_id_fkey'
    `);

    console.log('Foreign Key Details:');
    console.log(fkQuery.rows);

    // Check if user was created
    console.log('\n=== Recently Created Users ===\n');
    const usersQuery = await pool.query(`
      SELECT id, email, role::text, created_at
      FROM public.users
      WHERE email = 'startup1@test.com'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('Users found:', usersQuery.rows);

    // Check auth.users table too
    console.log('\n=== Check auth.users ===\n');
    try {
      const authUsersQuery = await pool.query(`
        SELECT id, email, created_at
        FROM auth.users
        WHERE email = 'startup1@test.com'
        LIMIT 5
      `);
      console.log('Auth users found:', authUsersQuery.rows);
    } catch (err) {
      console.log('Could not query auth.users:', err.message);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
