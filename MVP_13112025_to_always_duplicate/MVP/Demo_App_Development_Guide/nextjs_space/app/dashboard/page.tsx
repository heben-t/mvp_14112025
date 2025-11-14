import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StartupDashboard from '@/components/dashboard/startup-dashboard';
import InvestorDashboard from '@/components/dashboard/investor-dashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role === 'STARTUP') {
    return <StartupDashboard user={user} />;
  }

  if (user.role === 'INVESTOR') {
    return <InvestorDashboard user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Role</h1>
        <p className="text-gray-600">Please contact support.</p>
      </div>
    </div>
  );
}
