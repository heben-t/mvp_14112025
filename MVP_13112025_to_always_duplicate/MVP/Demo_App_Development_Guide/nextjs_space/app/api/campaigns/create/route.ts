import { createServerSupabaseClient } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CAMPAIGN CREATE API CALLED ===');
    
    // Simple auth check
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const startupProfile = await prisma.startup_profiles.findUnique({
      where: { userId: user.id },
    });

    if (!startupProfile) {
      console.error('Startup profile not found for user:', user.id);
      return NextResponse.json(
        { error: 'Startup profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    console.log('Startup profile found:', startupProfile.id);

    const data = await request.json();
    console.log('Request data:', data);

    const {
      title,
      campaignObjective,
      description,
      vslUrl,
      pitchDeck,
      status,
    } = data;

    if (!title || !campaignObjective || !description) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: title, campaign objective, and description are required' },
        { status: 400 }
      );
    }

    console.log('Creating campaign with status:', status);

    const campaign = await prisma.campaigns.create({
      data: {
        startup_profile_id: startupProfile.id,
        title,
        campaign_objective: campaignObjective,
        description,
        vsl_url: vslUrl || null,
        pitch_deck: pitchDeck || null,
        status: status || 'draft',
        published_at: status === 'published' ? new Date() : null,
      },
    });

    console.log('Campaign created successfully:', campaign.id);

    return NextResponse.json({
      success: true,
      campaign,
      message: status === 'published' 
        ? 'Campaign published successfully! It is now visible to investors.' 
        : 'Campaign saved as draft.',
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
