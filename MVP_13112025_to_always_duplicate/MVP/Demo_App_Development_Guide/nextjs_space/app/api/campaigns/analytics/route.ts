import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Verify ownership
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('startup_profile_id, startup_profiles(userId)')
      .eq('id', campaignId)
      .single();

    if (!campaign || (campaign.startup_profiles as any)?.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get analytics data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: analytics, error } = await supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Calculate totals
    const totals = {
      views: analytics?.reduce((sum, day) => sum + (day.views || 0), 0) || 0,
      uniqueVisitors: analytics?.reduce((sum, day) => sum + (day.unique_visitors || 0), 0) || 0,
      watchlistAdds: analytics?.reduce((sum, day) => sum + (day.watchlist_adds || 0), 0) || 0,
      pitchDeckViews: analytics?.reduce((sum, day) => sum + (day.pitch_deck_views || 0), 0) || 0,
      videoPlays: analytics?.reduce((sum, day) => sum + (day.video_plays || 0), 0) || 0,
      websiteClicks: analytics?.reduce((sum, day) => sum + (day.website_clicks || 0), 0) || 0,
      avgTimeOnPage: analytics?.length
        ? Math.round(analytics.reduce((sum, day) => sum + (day.average_time_on_page || 0), 0) / analytics.length)
        : 0,
    };

    // Get questions count
    const { count: questionsCount } = await supabase
      .from('campaign_questions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .is('answer', null);

    return NextResponse.json({
      analytics: analytics || [],
      totals,
      unansweredQuestions: questionsCount || 0,
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, eventType } = body;

    if (!campaignId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's analytics record
    const { data: existing } = await supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    const updates: any = {};
    
    switch (eventType) {
      case 'view':
        updates.views = (existing?.views || 0) + 1;
        updates.unique_visitors = (existing?.unique_visitors || 0) + 1;
        break;
      case 'pitch_deck_view':
        updates.pitch_deck_views = (existing?.pitch_deck_views || 0) + 1;
        break;
      case 'video_play':
        updates.video_plays = (existing?.video_plays || 0) + 1;
        break;
      case 'website_click':
        updates.website_clicks = (existing?.website_clicks || 0) + 1;
        break;
      case 'watchlist_add':
        updates.watchlist_adds = (existing?.watchlist_adds || 0) + 1;
        break;
    }

    if (existing) {
      await supabase
        .from('campaign_analytics')
        .update(updates)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('campaign_analytics')
        .insert({
          campaign_id: campaignId,
          date: today,
          ...updates,
        });
    }

    // Also update campaign totals
    if (eventType === 'view') {
      await supabase
        .from('campaigns')
        .update({ 
          total_views: (existing?.views || 0) + 1,
          view_count: (existing?.views || 0) + 1 
        })
        .eq('id', campaignId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
