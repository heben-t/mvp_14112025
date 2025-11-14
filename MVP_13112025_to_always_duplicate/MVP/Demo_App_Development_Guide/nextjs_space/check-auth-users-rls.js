const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Checking RLS on auth.users ===\n');

    const rlsStatus = await pool.query(`
      SELECT
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'auth'
        AND tablename = 'users'
    `);

    if (rlsStatus.rows.length > 0) {
      const rls = rlsStatus.rows[0];
      console.log(`Table: auth.${rls.tablename}`);
      console.log(`RLS Enabled: ${rls.rls_enabled ? 'YES' : 'NO'}\n`);

      if (rls.rls_enabled) {
        const policies = await pool.query(`
          SELECT
            policyname as policy_name,
            cmd as command,
            permissive,
            roles,
            qual as using_expression,
            with_check as with_check_expression
          FROM pg_policies
          WHERE schemaname = 'auth'
            AND tablename = 'users'
        `);

        if (policies.rows.length > 0) {
          console.log('RLS Policies on auth.users:');
          policies.rows.forEach(row => {
            console.log(`\n  Policy: ${row.policy_name}`);
            console.log(`    Command: ${row.command}`);
            console.log(`    Permissive: ${row.permissive}`);
            console.log(`    Roles: ${row.roles}`);
            console.log(`    USING: ${row.using_expression || 'none'}`);
            console.log(`    WITH CHECK: ${row.with_check_expression || 'none'}`);
          });
        } else {
          console.log('No RLS policies found on auth.users');
        }
      }
    }

    console.log('\n=== Checking for other functions that might be failing ===\n');

    // Get list of all functions in auth schema
    const functions = await pool.query(`
      SELECT
        p.proname as function_name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'auth'
        AND p.proname LIKE '%user%'
      ORDER BY p.proname
      LIMIT 10
    `);

    if (functions.rows.length > 0) {
      console.log('Auth schema functions related to users:');
      functions.rows.forEach(row => {
        console.log(`  - ${row.function_name}`);
      });
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
