import { getServiceRoleClient } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Starting database migration...');

    const supabase = getServiceRoleClient();

    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'prisma', 'migrations', 'schema_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL migration...');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    console.log('Migration completed successfully!');
    console.log('Created tables:');
    console.log('  - users');
    console.log('  - accounts');
    console.log('  - sessions');
    console.log('  - verification_tokens');
    console.log('  - startup_profiles');
    console.log('  - investor_profiles');
    console.log('  - investor_preferences');
    console.log('  - subscriptions');
    console.log('  - campaigns');
    console.log('  - investments');
    console.log('  - watchlists');
    console.log('  - startup_metrics');
    console.log('  - portfolio_companies');
    console.log('  - time_series_data');
    console.log('  - operations');
    console.log('  - alerts');
    console.log('  - benchmarks');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runMigration();
