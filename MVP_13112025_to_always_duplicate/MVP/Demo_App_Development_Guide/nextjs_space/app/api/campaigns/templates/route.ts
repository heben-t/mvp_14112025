import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('campaign_templates')
      .select('*')
      .order('success_rate', { ascending: false });

    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    return NextResponse.json({ templates: templates || [] });
  } catch (error) {
    console.error('Error fetching campaign templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
