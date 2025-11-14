import { getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaign = await prisma.campaigns.findUnique({
      where: { id: params.id },
      include: {
        startup_profiles: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.startup_profiles.userId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this campaign' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { action, ...updateData } = data;

    if (action === 'publish') {
      if (campaign.status === 'published') {
        return NextResponse.json(
          { error: 'Campaign is already published' },
          { status: 400 }
        );
      }

      const updatedCampaign = await prisma.campaigns.update({
        where: { id: params.id },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        campaigns: updatedCampaign,
        message: 'Campaign published successfully',
      });
    }

    if (action === 'unpublish') {
      const updatedCampaign = await prisma.campaigns.update({
        where: { id: params.id },
        data: {
          status: 'draft',
          publishedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        campaigns: updatedCampaign,
        message: 'Campaign unpublished',
      });
    }

    const updatedCampaign = await prisma.campaigns.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      campaigns: updatedCampaign,
      message: 'Campaign updated successfully',
    });
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
