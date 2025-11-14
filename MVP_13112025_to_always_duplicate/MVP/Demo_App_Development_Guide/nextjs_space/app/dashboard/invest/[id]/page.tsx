import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InvestmentPayment from '@/components/investments/investment-payment';

export default async function InvestmentPaymentPage({ 
  params,
  searchParams 
}: { 
  params: { id: string };
  searchParams: { clientSecret?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role !== 'INVESTOR') {
    redirect('/dashboard');
  }

  if (!searchParams.clientSecret) {
    redirect('/dashboard');
  }

  return (
    <InvestmentPayment 
      investmentId={params.id} 
      clientSecret={searchParams.clientSecret}
      user={user}
    />
  );
}
