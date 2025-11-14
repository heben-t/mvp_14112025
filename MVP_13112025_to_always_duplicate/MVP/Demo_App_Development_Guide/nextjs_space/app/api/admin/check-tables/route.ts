import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceRoleClient();

    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      // Try alternative method using raw SQL
      const { data: tablesData, error: sqlError } = await supabase.rpc('get_tables');

      if (sqlError) {
        return NextResponse.json({
          error: 'Could not fetch tables',
          details: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        tables: tablesData,
        count: tablesData?.length || 0
      });
    }

    return NextResponse.json({
      tables: data?.map((t: any) => t.table_name) || [],
      count: data?.length || 0
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check tables' },
      { status: 500 }
    );
  }
}
