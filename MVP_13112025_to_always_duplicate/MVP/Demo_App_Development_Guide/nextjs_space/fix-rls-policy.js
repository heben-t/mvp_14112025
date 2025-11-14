const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.gnzcvhyxiatcjofywkdq:hebedaihebed@aws-1-us-west-1.pooler.supabase.com:5432/postgres'
});

(async () => {
  try {
    console.log('=== Adding INSERT policy for user_profiles ===\n');

    // Create a policy that allows inserts for authenticated users during signup
    // The trigger runs as the postgres user (SECURITY DEFINER), so we need a policy
    // that allows the system to insert new user profiles
    const result = await pool.query(`
      CREATE POLICY "Allow signup to create user profile"
      ON public.user_profiles
      FOR INSERT
      WITH CHECK (true);
    `);

    console.log('✓ Successfully created INSERT policy for user_profiles');
    console.log('  Policy: "Allow signup to create user profile"');
    console.log('  Allows: INSERT operations');
    console.log('  WITH CHECK: true (allows all inserts)');

    console.log('\n=== Verifying policies ===\n');
    const policies = await pool.query(`
      SELECT
        policyname as policy_name,
        cmd as command
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_profiles'
      ORDER BY cmd
    `);

    policies.rows.forEach(row => {
      console.log(`✓ ${row.command}: ${row.policy_name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('\nIf the policy already exists, you can drop it first with:');
    console.error('DROP POLICY "Allow signup to create user profile" ON public.user_profiles;');
    process.exit(1);
  }
})();
