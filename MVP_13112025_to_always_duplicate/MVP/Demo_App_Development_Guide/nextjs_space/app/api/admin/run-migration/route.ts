import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    const supabase = getServiceRoleClient();

    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'prisma', 'migrations', 'schema_migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          console.error(`Statement ${i + 1} failed:`, error);
          errors.push({ statement: i + 1, error: error.message });
        } else {
          results.push({ statement: i + 1, success: true });
        }
      } catch (err: any) {
        console.error(`Statement ${i + 1} error:`, err);
        errors.push({ statement: i + 1, error: err.message });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      executed: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
