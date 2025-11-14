

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';

export default async function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (user.role !== 'STARTUP') {
    redirect('/dashboard');
  }

  const startupProfile = await prisma.startup_profiles.findUnique({
    where: { userId: user.id },
  });

  if (!startupProfile) {
    redirect('/auth/onboarding/startup');
  }

  const campaign = await prisma.campaigns.findFirst({
    where: {
      id: params.id,
      startupProfileId: startupProfile.id,
    },
  });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <p className="text-muted-foreground mt-2">
            Update your campaign details
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            Campaign editing feature coming soon. For now, you can view your campaign details.
          </p>
        </div>
      </div>
    </div>
  );
}
