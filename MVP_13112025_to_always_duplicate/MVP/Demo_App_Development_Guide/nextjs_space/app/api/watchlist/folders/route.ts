import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get investor profile
    const { data: profile } = await supabase
      .from('investor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Investor profile not found' }, { status: 404 });
    }

    // Get folders with watchlist counts
    const { data: folders, error } = await supabase
      .from('watchlist_folders')
      .select('*, watchlists(count)')
      .eq('investor_profile_id', profile.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ folders: folders || [] });
  } catch (error) {
    console.error('Error fetching watchlist folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
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

    const body = await request.json();
    const { name, color, icon } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get investor profile
    const { data: profile } = await supabase
      .from('investor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Investor profile not found' }, { status: 404 });
    }

    // Create folder
    const { data: folder, error } = await supabase
      .from('watchlist_folders')
      .insert({
        investor_profile_id: profile.id,
        name,
        color: color || '#3b82f6',
        icon: icon || 'folder',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
