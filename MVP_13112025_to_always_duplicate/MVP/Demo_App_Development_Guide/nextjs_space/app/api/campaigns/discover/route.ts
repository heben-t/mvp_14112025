import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const industry = searchParams.get('industry') || '';
    const stage = searchParams.get('stage') || '';
    const minAmount = searchParams.get('minAmount') || '';
    const maxAmount = searchParams.get('maxAmount') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;
    
    const supabase = getServiceRoleClient();
    
    // Build query
    let query = supabase
      .from('campaigns')
      .select('*, startup_profiles(company_name, logo)', { count: 'exact' })
      .eq('status', 'ACTIVE');

    // Apply filters
    if (industry) {
      query = query.eq('industry', industry);
    }

    if (stage) {
      query = query.eq('stage', stage);
    }

    if (minAmount) {
      query = query.gte('fundraising_goal', parseFloat(minAmount));
    }

    if (maxAmount) {
      query = query.lte('fundraising_goal', parseFloat(maxAmount));
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Execute query with pagination
    const { data: campaigns, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Campaign discovery error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const hasMore = offset + (campaigns?.length || 0) < total;

    return NextResponse.json({
      campaigns: campaigns || [],
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error('Campaign discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
