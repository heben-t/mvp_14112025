import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CampaignForm } from '@/components/campaigns/campaign-form';


export default async function NewCampaignPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role !== 'STARTUP') {
    redirect('/dashboard');
  }

  return <CampaignForm user={user} />;
}
