const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Checking RLS status on user_profiles ===\n');

    const rlsStatus = await pool.query(`
      SELECT
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = 'user_profiles'
    `);

    if (rlsStatus.rows.length > 0) {
      const rls = rlsStatus.rows[0];
      console.log(`Table: ${rls.tablename}`);
      console.log(`RLS Enabled: ${rls.rls_enabled ? 'YES' : 'NO'}`);
    }

    console.log('\n=== Checking RLS policies on user_profiles ===\n');
    const policies = await pool.query(`
      SELECT
        policyname as policy_name,
        cmd as command,
        qual as using_expression,
        with_check as with_check_expression
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_profiles'
    `);

    if (policies.rows.length > 0) {
      policies.rows.forEach(row => {
        console.log(`Policy: ${row.policy_name}`);
        console.log(`  Command: ${row.command}`);
        console.log(`  USING: ${row.using_expression || 'none'}`);
        console.log(`  WITH CHECK: ${row.with_check_expression || 'none'}`);
        console.log('');
      });
    } else {
      console.log('No RLS policies found on user_profiles');
    }

    console.log('\n=== Checking function owner and permissions ===\n');
    const funcInfo = await pool.query(`
      SELECT
        p.proname as function_name,
        pg_catalog.pg_get_userbyid(p.proowner) as owner,
        p.prosecdef as security_definer
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'handle_new_user'
        AND n.nspname = 'public'
    `);

    if (funcInfo.rows.length > 0) {
      const func = funcInfo.rows[0];
      console.log(`Function: ${func.function_name}`);
      console.log(`Owner: ${func.owner}`);
      console.log(`Security Definer: ${func.security_definer ? 'YES' : 'NO'}`);
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
