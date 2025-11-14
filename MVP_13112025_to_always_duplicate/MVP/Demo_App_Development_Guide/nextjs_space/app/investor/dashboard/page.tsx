import { redirect } from 'next/navigation';

export default function InvestorDashboardRedirect() {
  // Redirect old incorrect URL to correct dashboard path
  redirect('/dashboard');
}
