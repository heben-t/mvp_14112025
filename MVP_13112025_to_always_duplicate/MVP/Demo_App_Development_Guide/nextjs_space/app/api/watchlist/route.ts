import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    const { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const { data: watchlist, error } = await supabase
      .from('watchlists')
      .select(`
        *,
        campaigns (
          *,
          startup_profiles (
            company_name,
            industry,
            logo
          )
        )
      `)
      .eq('investorProfileId', investorProfile.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ watchlist: watchlist || [] });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    const { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const { campaignId } = await request.json();

    const { data: existing } = await supabase
      .from('watchlists')
      .select('*')
      .eq('investorProfileId', investorProfile.id)
      .eq('campaignId', campaignId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Campaign already in watchlist' },
        { status: 400 }
      );
    }

    const { data: watchlistItem, error } = await supabase
      .from('watchlists')
      .insert({
        investorProfileId: investorProfile.id,
        campaignId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, watchlistItem });
  } catch (error) {
    console.error('Watchlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    const { data: investorProfile } = await supabase
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('investorProfileId', investorProfile.id)
      .eq('campaignId', campaignId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
